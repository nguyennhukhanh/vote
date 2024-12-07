export interface IContest {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  voteId: number;
}

export interface ICandidate {
  id: number;
  candidateId: number;
  name: string;
  contests: IContest;
  description?: string;
  totalVotes: number;
  blockTimestamp: string;
  blockNumber: string;
  transactionHash: string;
  createdAt: string;
}
