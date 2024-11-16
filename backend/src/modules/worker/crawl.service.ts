import { Logger } from '@thanhhoajs/logger';
import { and, eq } from 'drizzle-orm';
import { JsonRpcProvider, type Provider } from 'ethers';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import { appConfig } from 'src/configs/app.config';
import {
  type MultiContestVotingAbi,
  MultiContestVotingAbi__factory,
} from 'src/contracts';
import { db } from 'src/database/db';
import { candidates } from 'src/database/schemas/candidates.schema';
import { contests } from 'src/database/schemas/contests.schema';
import { latestBlocks } from 'src/database/schemas/latest-blocks.schema';
import { users } from 'src/database/schemas/users.schema';
import { getFromCache } from 'src/utils/cache';
import { unixToUTCDate } from 'src/utils/moment';

import type { RedisService } from '../services/redis.service';

const logger = Logger.get('CrawlService');

enum EventEnum {
  CandidateAdded = 'CandidateAdded',
  VoteCreated = 'VoteCreated',
  Voted = 'Voted',
}

const BATCH_SIZE = 100;
const BATCH_LIMIT = 20;
const limit = pLimit(BATCH_LIMIT);

export class CrawlService {
  private _provider: Provider = new JsonRpcProvider(appConfig.rpcEndpoint);
  private _contractAddress = appConfig.contractAddress;
  private _contract!: MultiContestVotingAbi;
  private _ethersReady = false;
  private _latestBlock!: number;
  private _beginningBlock = 45683652;
  private _symbolNetwork = 'BSC';
  constructor(private readonly redisService: RedisService) {
    this.init().catch((error) => {
      logger.error('Init Crawl Token Worker Error:', error);
    });
  }

  async init() {
    this._ethersReady = await this.startEthers();

    if (this._ethersReady) {
      await this.listenPastEvents();
      await this.listenRealtimeEvents();
    } else {
      logger.error('Ethers is not ready yet!');
      return;
    }
  }

  async startEthers(): Promise<boolean> {
    const retryOptions = {
      retries: 5,
      factor: 2,
      minTimeout: 5000,
      maxTimeout: 30000,
      onFailedAttempt: (error: any) => {
        logger.verbose(
          `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
          error,
        );
      },
    };

    try {
      await pRetry(async () => {
        this._contract = MultiContestVotingAbi__factory.connect(
          this._contractAddress,
          this._provider,
        );

        const network = await this._provider.getNetwork();
        if (!network) {
          throw new Error('Failed to connect to provider');
        }
      }, retryOptions);

      return true;
    } catch (error) {
      logger.error('Error starting Ethers after retries:', error);
      return false;
    }
  }

  async listenPastEvents(): Promise<void> {
    this._latestBlock = await this.getLatestBlock();
    const key = `crawl:${this._symbolNetwork}_${this._contractAddress}`;
    // const latestBlockRedis = await this.redisService.get(key);
    // if (latestBlockRedis && Number(latestBlockRedis) > this._latestBlock) {
    //   this._latestBlock = Number(latestBlockRedis);
    // }

    let fromBlock = Number(this._latestBlock);
    const toBlock = await this._provider.getBlockNumber();

    while (fromBlock <= toBlock) {
      const batchToBlock = Math.min(fromBlock + BATCH_SIZE - 1, toBlock);

      const events = await this.fetchEventsBatch(fromBlock, batchToBlock);

      if (events.length > 0) {
        await this.handleEventsInBatches(events);
        await this.updateLatestBlock(batchToBlock);
      }

      logger.debug(
        `[${this._symbolNetwork}] | Crawl: ${fromBlock} - ${batchToBlock}`,
      );

      fromBlock = batchToBlock + 1;
    }

    logger.info(`[${this._symbolNetwork}] | Crawl with Past Events: Done!`);
    this._latestBlock = fromBlock;
  }

  async listenRealtimeEvents(): Promise<void> {
    const poll = async () => {
      try {
        const latestBlock = await this._provider.getBlockNumber();
        const events = await this.fetchEventsBatch(
          this._latestBlock,
          latestBlock,
        );

        if (events.length > 0) {
          await this.handleEventsInBatches(events);
        } else {
          logger.debug(
            `[${this._symbolNetwork}] | No new events found: ${this._latestBlock} - ${latestBlock}`,
          );
        }

        this._latestBlock = latestBlock;
        const key = `crawl:${this._symbolNetwork}_${this._contractAddress}`;
        await this.redisService.set(key, this._latestBlock, 3600); // 1 hour
      } catch (error) {
        logger.error(
          `[${this._symbolNetwork}] | Error polling for real-time events: ${error}`,
        );
      }

      setTimeout(poll, 10000);
    };

    poll();
  }

  private async getLatestBlock(): Promise<number> {
    const latestBlockKey = `crawl_${this._symbolNetwork}_${this._contractAddress}`;

    return await db.transaction(async (tx) => {
      const [latestBlock] = await tx
        .select({ blockNumber: latestBlocks.blockNumber })
        .from(latestBlocks)
        .where(eq(latestBlocks.key, latestBlockKey))
        .limit(1)
        .for('update')
        .execute();

      return (
        Number(latestBlock?.blockNumber) ||
        appConfig.beginningBlock ||
        this._beginningBlock
      );
    });
  }

  private async updateLatestBlock(toBlock: number): Promise<void> {
    await db.transaction(async (tx) => {
      const latestBlockKey = `crawl_${this._symbolNetwork}_${this._contractAddress}`;

      const [latestBlock] = await tx
        .select({
          key: latestBlocks.key,
          blockNumber: latestBlocks.blockNumber,
        })
        .from(latestBlocks)
        .where(eq(latestBlocks.key, latestBlockKey))
        .limit(1)
        .for('update')
        .execute();

      if (!latestBlock) {
        await tx
          .insert(latestBlocks)
          .values({
            key: latestBlockKey,
            blockNumber: BigInt(toBlock),
          })
          .execute();
      }
    });
  }

  private async handleCandidateAddedEvent(event: any): Promise<void> {
    logger.info(`Handling CandidateAdded event: ${JSON.stringify(event)}`);

    const { blockNumber, transactionHash, address } = event;
    const [voteId, candidateId, name] = event.args;

    const transaction = await this._provider.getTransaction(transactionHash);

    if (!transaction) {
      logger.error(`Transaction not found for hash: ${transactionHash}`);
      return;
    }
    const from = transaction.from;
    const to = transaction.to;

    const block = await this._provider.getBlock(blockNumber);
    if (!block) {
      logger.error(`Block not found for block number: ${blockNumber}`);
      return;
    }
    const { timestamp } = block;

    await db.transaction(async (tx) => {
      const candidateAddedExist = await getFromCache(
        `candidateAdded_${transactionHash}_${blockNumber}`,
        async () => {
          const [candidateAdded] = await tx
            .select({ id: candidates.id })
            .from(candidates)
            .where(
              and(
                eq(candidates.transactionHash, transactionHash),
                eq(candidates.blockNumber, BigInt(timestamp)),
              ),
            )
            .limit(1);

          return candidateAdded;
        },
        60, // 1 minute
      );

      if (!candidateAddedExist) {
        const [userExist] = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.walletAddress, from))
          .limit(1)
          .execute();

        if (userExist) {
          await tx
            .insert(candidates)
            .values({
              voteId,
              candidateId,
              blockTimestamp: unixToUTCDate(timestamp),
              blockNumber,
              transactionHash,
            })
            .execute();

          logger.verbose(
            `[${this._symbolNetwork}] | Crawl Candidate Successful [VoteID - CandidateID - Block Number - Transaction Hash]: [${voteId} - ${candidateId} - ${blockNumber} - ${transactionHash}]`,
          );
        }
      }

      await this.updateLatestBlock(blockNumber);
    });
  }

  private async fetchEvents(
    eventName: EventEnum,
    fromBlock: number,
    toBlock: number,
  ): Promise<any[]> {
    const filter = this._contract.filters[eventName]();
    return await this._contract.queryFilter(filter, fromBlock, toBlock);
  }

  private async fetchEventsBatch(
    fromBlock: number,
    toBlock: number,
  ): Promise<any[]> {
    const eventNames = Object.values(EventEnum);
    const eventPromises = eventNames.map((eventName) =>
      this.fetchEvents(eventName, fromBlock, toBlock),
    );
    const eventsArray = await Promise.all(eventPromises);
    return eventsArray.flat();
  }

  private async handleEventsInBatches(events: any[]): Promise<void> {
    const promises = events.map((event) => {
      switch (event.eventName) {
        case EventEnum.CandidateAdded:
          return limit(() => this.handleCandidateAddedEvent(event));
        case EventEnum.VoteCreated:
          return limit(() => this.handleVoteCreatedEvent(event));
        case EventEnum.Voted:
          return limit(() => this.handleVotedEvent(event));
        default:
          return Promise.resolve();
      }
    });
    await Promise.all(promises);
  }

  private async handleVoteCreatedEvent(event: any): Promise<void> {
    logger.info(`Handling VoteCreated event: ${JSON.stringify(event)}`);

    const { blockNumber, transactionHash, address } = event;
    const [voteId, startTime, endTime] = event.args;

    const transaction = await this._provider.getTransaction(transactionHash);

    if (!transaction) {
      logger.error(`Transaction not found for hash: ${transactionHash}`);
      return;
    }
    const from = transaction.from;
    const to = transaction.to;

    const block = await this._provider.getBlock(blockNumber);
    if (!block) {
      logger.error(`Block not found for block number: ${blockNumber}`);
      return;
    }
    const { timestamp } = block;

    await db.transaction(async (tx) => {
      const contestsCreatedExist = await getFromCache(
        `contestsCreated_${transactionHash}_${blockNumber}`,
        async () => {
          const [contestsCreated] = await tx
            .select({ id: contests.id })
            .from(contests)
            .where(
              and(
                eq(contests.transactionHash, transactionHash),
                eq(contests.blockNumber, BigInt(timestamp)),
              ),
            )
            .limit(1);

          return contestsCreated;
        },
        60, // 1 minute
      );

      if (!contestsCreatedExist) {
        await tx
          .insert(contests)
          .values({
            voteId,
            startTime: unixToUTCDate(startTime),
            endTime: unixToUTCDate(endTime),
            blockTimestamp: unixToUTCDate(timestamp),
            blockNumber,
            transactionHash,
          })
          .execute();

        logger.verbose(
          `[${this._symbolNetwork}] | Crawl Contest Successful [VoteID - StartTime - EndTime - Block Number - Transaction Hash]: [${voteId} - ${startTime} - ${endTime} - ${blockNumber} - ${transactionHash}]`,
        );
      }

      await this.updateLatestBlock(blockNumber);
    });
  }

  private async handleVotedEvent(event: any): Promise<void> {
    // Implement handling logic for Voted event
    logger.info(`Handling Voted event: ${JSON.stringify(event)}`);
  }
}
