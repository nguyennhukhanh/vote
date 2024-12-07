export interface ICreateContest {
  name: string;
  startTime: string;
  endTime: string;
}

export interface IContest extends ICreateContest {
  id: number;
  voteId: number;
  createdBy: {
    id: number;
    fullName: string;
    email: string;
  };
  blockTimestamp: string;
  blockNumber: string;
  transactionHash: string;
  createdAt: string;
}

export interface IPaginatedResponse<T> {
  items: T[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
