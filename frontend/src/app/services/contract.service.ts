import { Injectable } from '@angular/core';
import { ethers } from 'ethers';

import { MultiContestVotingAbi } from '../../common/constants/presidential_election_abi.const';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private _provider: ethers.BrowserProvider;
  private _contract: ethers.Contract | any;

  constructor() {
    const { ethereum } = <any>window;
    this._provider = new ethers.BrowserProvider(ethereum);

    this.init()
      .then(() => {
        console.log('Contract initialized');
      })
      .catch((error) => {
        console.error('Error initializing contract:', error);
      });
  }

  async init() {
    try {
      const signer = await this._provider.getSigner();
      this._contract = new ethers.Contract(
        environment.contractAddress,
        MultiContestVotingAbi,
        signer,
      );
    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  }

  async getCandidate(voteId: number, candidateId: number) {
    try {
      const candidate = await this._contract.getCandidate(voteId, candidateId);
      return candidate;
    } catch (error) {
      console.error('Error fetching candidate:', error);
    }
  }

  async getContest(voteId: number) {
    try {
      if (!this._contract) {
        await this.init();
      }
      const contest = await this._contract.votes(voteId);
      return contest;
    } catch (error) {
      console.error('Error fetching contest:', error);
      throw error;
    }
  }

  async vote(votedId: number, candidateId: number) {
    try {
      const tx = await this._contract.vote(votedId, candidateId);
      const receipt = await tx.wait();
      return { success: true, receipt };
    } catch (error) {
      throw error;
    }
  }
}
