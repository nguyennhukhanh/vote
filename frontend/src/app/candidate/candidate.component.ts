import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

import { ContestTimeStatus } from '../../common/enums';
import { CandidateApiEnum, VoteApiEnum } from '../../common/enums/api.enum';
import type { IMeta } from '../../common/interfaces';
import type { ICandidate } from '../../common/interfaces/candidate.interface';
import type { IResponse } from '../../common/interfaces/response.interface';
import type { IVoter } from '../../common/interfaces/voter.interface';
import { formatDate } from '../../common/utils/time.util';
import { environment } from '../../environments/environment.development';
import { NavbarComponent } from '../navbar/navbar.component';
import { ContractService } from '../services/contract.service';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './candidate.component.html',
  styleUrl: './candidate.component.sass',
})
export class CandidateComponent implements OnInit {
  candidates: { items: ICandidate[]; meta: IMeta } = {
    items: [],
    meta: {
      itemCount: 0,
      totalItems: 0,
      itemsPerPage: 0,
      totalPages: 0,
      currentPage: 0,
    },
  };
  voteId: number | undefined;
  isLoading: boolean = true;
  search: string = '';
  fromDate: string = '';
  toDate: string = '';
  sort: string = 'DESC';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  bscScanUrl: string = environment.bscScanUrl;
  protected readonly Math = Math;
  showVoteModal: boolean = false;
  selectedCandidate: any = null;
  isVoting: boolean = false;
  contestInfo: any;
  contestStatus: ContestTimeStatus = ContestTimeStatus.UPCOMING;
  isLoadingContract: boolean = false;
  contractError: string | null = null;
  voters: { items: IVoter[]; meta: IMeta } = {
    items: [],
    meta: {
      itemCount: 0,
      totalItems: 0,
      itemsPerPage: 0,
      totalPages: 0,
      currentPage: 0,
    },
  };
  isLoadingVoters: boolean = false;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
    @Inject(ActivatedRoute) private route: ActivatedRoute,
    @Inject(ContractService) private contractService: ContractService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      const id = parseInt(params['contestId'], 10);
      if (!isNaN(id)) {
        this.voteId = id;
        await this.loadContestInfo();
        await this.loadCandidates();
      }
    });
  }

  clearFilters(): void {
    this.search = '';
    this.fromDate = '';
    this.toDate = '';
    this.onSearch();
  }

  async loadCandidates(): Promise<void> {
    if (!this.voteId) return;
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const queryParams = new URLSearchParams({
        page: this.currentPage.toString(),
        limit: this.itemsPerPage.toString(),
        sort: this.sort,
        voteId: this.voteId.toString(),
      });

      if (this.search) queryParams.append('search', this.search);
      if (this.fromDate) queryParams.append('fromDate', this.fromDate);
      if (this.toDate) queryParams.append('toDate', this.toDate);

      const response = await firstValueFrom(
        this.http.get<IResponse>(
          `${environment.apiUrl}${CandidateApiEnum.PREFIX}?${queryParams}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.candidates = response.data;
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadContestInfo(): Promise<void> {
    if (!this.voteId) return;

    this.isLoadingContract = true;
    this.contractError = null;

    try {
      const contest = await this.contractService.getContest(this.voteId);
      console.log('Contest data:', contest); // Debug log

      if (!contest) {
        throw new Error('Contest not found');
      }

      this.contestInfo = contest;
      const now = moment.utc().unix();
      const startTime = Number(contest.startTime);
      const endTime = Number(contest.endTime);

      console.log('Time comparison:', { now, startTime, endTime }); // Debug log

      if (now < startTime) {
        this.contestStatus = ContestTimeStatus.UPCOMING;
      } else if (now > endTime) {
        this.contestStatus = ContestTimeStatus.ENDED;
      } else {
        this.contestStatus = ContestTimeStatus.ACTIVE;
      }

      console.log('Contest status:', this.contestStatus); // Debug log
    } catch (error) {
      console.error('Error loading contest info:', error);
      this.contractError =
        'Failed to load contest information. Please try again.';
    } finally {
      this.isLoadingContract = false;
    }
  }

  canVote(): boolean {
    if (this.isLoadingContract || !this.contestInfo) return false;
    const now = moment.utc().unix();
    const startTime = Number(this.contestInfo.startTime);
    const endTime = Number(this.contestInfo.endTime);

    return now >= startTime && now <= endTime;
  }

  getContestStatusMessage(): string {
    if (this.isLoadingContract) return 'Loading contest information...';
    if (this.contractError) return this.contractError;

    switch (this.contestStatus) {
      case ContestTimeStatus.UPCOMING:
        return `Voting starts ${this.formatDate(Number(this.contestInfo?.startTime) * 1000)}`;
      case ContestTimeStatus.ACTIVE:
        return `Voting ends ${this.formatDate(Number(this.contestInfo?.endTime) * 1000)}`;
      case ContestTimeStatus.ENDED:
        return 'Voting has ended';
      default:
        return '';
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCandidates();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCandidates();
  }

  formatDate(date: string | number): string {
    return formatDate(date);
  }

  async openVoteModal(candidate: any): Promise<void> {
    this.selectedCandidate = candidate;
    this.showVoteModal = true;
    await this.loadVoters();
  }

  async loadVoters(): Promise<void> {
    if (!this.voteId || !this.selectedCandidate) return;

    this.isLoadingVoters = true;
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const queryParams = new URLSearchParams({
        voteId: this.voteId.toString(),
        candidateId: this.selectedCandidate.candidateId.toString(),
        page: '1',
        limit: '10',
      });

      const response = await firstValueFrom(
        this.http.get<IResponse>(
          `${environment.apiUrl}${VoteApiEnum.PREFIX}?${queryParams}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.voters = response.data;
    } catch (error) {
      console.error('Error loading voters:', error);
    } finally {
      this.isLoadingVoters = false;
    }
  }

  closeVoteModal(): void {
    this.showVoteModal = false;
    this.selectedCandidate = null;
  }

  async submitVote(): Promise<void> {
    if (!this.selectedCandidate || !this.voteId) return;

    this.isVoting = true;

    try {
      const result = await this.contractService.vote(
        this.voteId,
        this.selectedCandidate.candidateId,
      );

      if (result.success) {
        toast.success('Vote submitted successfully!');
        this.closeVoteModal();
        await this.loadCandidates();
      } else {
        toast.error('Failed to submit vote. Please try again.');
      }
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('You have already voted');
    } finally {
      this.isVoting = false;
    }
  }
}
