import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ContestTimeStatus } from '../../common/enums';
import { ContestApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import {
  formatDate,
  getContestTimeStatus,
  getTimeRemaining,
} from '../../common/utils/time.util';
import { environment } from '../../environments/environment.development';
import type { ICreateContest } from '../interfaces/contest.interface';
import type {
  IContest,
  IPaginatedResponse,
} from '../interfaces/contest.interface';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-contest',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contest.component.html',
  styleUrl: './contest.component.sass',
})
export class ContestComponent implements OnInit {
  contests: IPaginatedResponse<IContest> = { items: [], meta: {} as any };
  isLoading: boolean = true;
  search: string = '';
  fromDate: string = '';
  toDate: string = '';
  sort: string = 'DESC';
  currentPage: number = 1;
  itemsPerPage: number = 6;
  bscScanUrl: string = environment.bscScanUrl;
  protected readonly Math = Math;
  showCreateModal: boolean = false;
  createForm: FormGroup;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
    @Inject(Router) private router: Router,
    @Inject(FormBuilder)
    private fb: FormBuilder,
  ) {
    this.createForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
      },
      { validators: this.dateValidator },
    );
  }

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
    switch (status) {
      case ContestTimeStatus.UPCOMING:
        return {
          badge: 'bg-blue-100 text-blue-800',
          card: 'border-l-4 border-blue-400',
        };
      case ContestTimeStatus.ACTIVE:
        return {
          badge: 'bg-green-100 text-green-800',
          card: 'border-l-4 border-green-400',
        };
      case ContestTimeStatus.ENDED:
        return {
          badge: 'bg-gray-100 text-gray-800',
          card: 'border-l-4 border-gray-400',
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          card: '',
        };
    }
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

  dateValidator(group: FormGroup) {
    const start = new Date(group.get('startTime')?.value);
    const end = new Date(group.get('endTime')?.value);
    const now = new Date();

    if (start < now) {
      return { pastStartDate: true };
    }
    if (end <= start) {
      return { endBeforeStart: true };
    }
    return null;
  }

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if (!this.showCreateModal) {
      this.createForm.reset();
    }
  }

  async createContest() {
    if (this.createForm.invalid) return;

    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const contestData: ICreateContest = this.createForm.value;

      await firstValueFrom(
        this.http.post<IResponse>(
          `${environment.apiUrl}${ContestApiEnum.PREFIX}`,
          contestData,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );

      this.toggleCreateModal();
      await this.loadContests();
    } catch (error) {
      console.error('Error creating contest:', error);
    }
  }

  get contestStats() {
    const total = this.contests.meta.totalItems || 0;
    const active = this.contests.items.filter(
      (contest) => this.getContestStatus(contest) === ContestTimeStatus.ACTIVE,
    ).length;
    const upcoming = this.contests.items.filter(
      (contest) =>
        this.getContestStatus(contest) === ContestTimeStatus.UPCOMING,
    ).length;

    return { total, active, upcoming };
  }

  getGridCols(): string {
    return this.contests.items.length < 3
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }
}
