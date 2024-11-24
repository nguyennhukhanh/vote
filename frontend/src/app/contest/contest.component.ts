import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ContestTimeStatus } from '../../common/enums';
import { ContestApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import {
  formatDate,
  getContestStatusStyle,
  getContestTimeStatus,
  getTimeRemaining,
} from '../../common/utils/time.util';
import { environment } from '../../environments/environment.development';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-contest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contest.component.html',
  styleUrl: './contest.component.sass',
})
export class ContestComponent implements OnInit {
  contests: any = { items: [], meta: {} };
  isLoading: boolean = true;
  search: string = '';
  fromDate: string = '';
  toDate: string = '';
  sort: string = 'DESC';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  bscScanUrl: string = environment.bscScanUrl;
  protected readonly Math = Math;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
    @Inject(Router) private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadContests();
  }

  clearFilters(): void {
    this.search = '';
    this.fromDate = '';
    this.toDate = '';
    this.onSearch();
  }

  async loadContests(): Promise<void> {
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const queryParams = new URLSearchParams({
        page: this.currentPage.toString(),
        limit: this.itemsPerPage.toString(),
        sort: this.sort,
      });

      if (this.search) queryParams.append('search', this.search);
      if (this.fromDate) queryParams.append('fromDate', this.fromDate);
      if (this.toDate) queryParams.append('toDate', this.toDate);

      const response = await firstValueFrom(
        this.http.get<IResponse>(
          `${environment.apiUrl}${ContestApiEnum.PREFIX}?${queryParams}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.contests = response.data;
    } catch (error) {
      console.error('Error loading contests:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadContests();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadContests();
  }

  isContestActive(contest: any): boolean {
    return (
      getContestTimeStatus(contest.startTime, contest.endTime) ===
      ContestTimeStatus.ACTIVE
    );
  }

  formatDate(date: string): string {
    return formatDate(date);
  }

  getContestStatus(contest: any): ContestTimeStatus {
    return getContestTimeStatus(contest.startTime, contest.endTime);
  }

  getStatusStyle(status: ContestTimeStatus) {
    return getContestStatusStyle(status);
  }

  getTimeRemaining(contest: any): string {
    const status = getContestTimeStatus(contest.startTime, contest.endTime);

    if (status === ContestTimeStatus.UPCOMING) {
      return `Starts in ${getTimeRemaining(contest.startTime)}`;
    }
    if (status === ContestTimeStatus.ACTIVE) {
      return `${getTimeRemaining(contest.endTime)} remaining`;
    }
    return 'Contest ended';
  }

  viewCandidates(voteId: number): void {
    this.router.navigate([`/contest/${voteId}/candidate`]);
  }
}
