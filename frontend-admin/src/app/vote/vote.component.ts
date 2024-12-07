import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import {
  CandidateApiEnum,
  ContestApiEnum,
  VoteApiEnum,
} from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import { formatDate } from '../../common/utils/time.util';
import { environment } from '../../environments/environment.development';
import { NavbarComponent } from '../navbar/navbar.component';
import { StoreService } from '../services/store.service';

interface IVoteResponse {
  items: {
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
      fullName: string;
      email: string | null;
      walletAddress: string;
      createdAt: string;
    };
    blockTimestamp: string;
    blockNumber: string;
    transactionHash: string;
  }[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

@Component({
  selector: 'app-vote',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './vote.component.html',
  styleUrl: './vote.component.sass',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('150ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class VoteComponent implements OnInit {
  contests: any[] = [];
  candidates: any[] = [];
  votes: any = {
    items: [],
    meta: {
      itemCount: 0,
      totalItems: 0,
      itemsPerPage: 10,
      totalPages: 0,
      currentPage: 1,
    },
  };

  bscScanUrl = environment.bscScanUrl;

  // Filters
  selectedContest: any = null;
  selectedCandidate: any = null;
  search: string = '';
  fromDate: string = '';
  toDate: string = '';
  sort: string = 'DESC';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  isLoading: boolean = false;
  Math = Math;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
  ) {}

  async ngOnInit() {
    await this.loadContests();
    await this.loadVotes();
  }

  async loadContests() {
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const response = await firstValueFrom(
        this.http.get<IResponse>(
          `${environment.apiUrl}${ContestApiEnum.PREFIX}?page=1&limit=10`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.contests = response.data.items;
    } catch (error) {
      console.error('Error loading contests:', error);
    }
  }

  async loadCandidates() {
    if (!this.selectedContest) return;

    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const response = await firstValueFrom(
        this.http.get<IResponse>(
          `${environment.apiUrl}${CandidateApiEnum.PREFIX}?voteId=${this.selectedContest.voteId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.candidates = response.data.items;
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  }

  async loadVotes() {
    if (
      !this.selectedContest &&
      !this.search &&
      !this.fromDate &&
      !this.toDate
    ) {
      // Load all votes if no filters are applied
      this.isLoading = true;
      try {
        const accessToken = this.storeService.getTokens().accessToken;
        const queryParams = new URLSearchParams({
          page: this.currentPage.toString(),
          limit: this.itemsPerPage.toString(),
          sort: this.sort,
        });

        const response = await firstValueFrom(
          this.http.get<IResponse>(
            `${environment.apiUrl}${VoteApiEnum.PREFIX}?${queryParams}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          ),
        );
        this.votes = response.data;
      } catch (error) {
        console.error('Error loading votes:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.isLoading = true;
      try {
        const accessToken = this.storeService.getTokens().accessToken;
        const queryParams = new URLSearchParams({
          page: this.currentPage.toString(),
          limit: this.itemsPerPage.toString(),
          sort: this.sort,
        });

        if (this.selectedContest)
          queryParams.append('voteId', this.selectedContest.voteId);
        if (this.selectedCandidate)
          queryParams.append('candidateId', this.selectedCandidate.candidateId);
        if (this.search) queryParams.append('search', this.search);
        if (this.fromDate) queryParams.append('fromDate', this.fromDate);
        if (this.toDate) queryParams.append('toDate', this.toDate);

        const response = await firstValueFrom(
          this.http.get<IResponse>(
            `${environment.apiUrl}${VoteApiEnum.PREFIX}?${queryParams}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          ),
        );
        this.votes = response.data;
      } catch (error) {
        console.error('Error loading votes:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  onContestChange() {
    this.selectedCandidate = null;
    this.loadCandidates();
    this.loadVotes();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadVotes();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadVotes();
  }

  clearFilters() {
    this.selectedContest = null;
    this.selectedCandidate = null;
    this.search = '';
    this.fromDate = '';
    this.toDate = '';
    this.onSearch();
  }

  getPageNumbers(): number[] {
    const totalPages = this.votes.meta.totalPages;
    const currentPage = this.currentPage;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [...Array.from({ length: 5 }, (_, i) => i + 1), -1, totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        -1,
        ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i),
      ];
    }

    return [
      1,
      -1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      -1,
      totalPages,
    ];
  }

  protected readonly formatDate = formatDate;
}
