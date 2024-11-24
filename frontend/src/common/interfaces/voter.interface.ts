export interface IVoter {
  id: number;
  contest: {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    voteId: number;
  };
  candidate: {
    id: number;
    name: string;
    candidateId: number;
    voteId: number;
  };
  voter: {
    id: number;
    fullName: string | null;
    email: string | null;
    walletAddress: string;
    createdAt: string;
  };
  blockTimestamp: string;
  blockNumber: string;
  transactionHash: string;
}
