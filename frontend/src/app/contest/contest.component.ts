import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ContestApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
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
  bscScanUrl: string = 'https://testnet.bscscan.com/tx/';
  protected readonly Math = Math;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
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
          `${environment.apiUrl}${ContestApiEnum.GET_ALL}?${queryParams}`,
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
    const now = new Date().getTime();
    const startTime = new Date(contest.startTime).getTime();
    const endTime = new Date(contest.endTime).getTime();
    return now >= startTime && now <= endTime;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getContestStatus(contest: any): 'upcoming' | 'active' | 'ended' {
    const now = new Date().getTime();
    const startTime = new Date(contest.startTime).getTime();
    const endTime = new Date(contest.endTime).getTime();

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    return 'active';
  }

  getStatusStyle(status: 'upcoming' | 'active' | 'ended'): {
    badge: string;
    card: string;
  } {
    const styles = {
      upcoming: {
        badge: 'bg-yellow-100 text-yellow-800',
        card: 'border-l-4 border-yellow-400',
      },
      active: {
        badge: 'bg-green-100 text-green-800',
        card: 'border-l-4 border-green-400',
      },
      ended: {
        badge: 'bg-gray-100 text-gray-800',
        card: 'border-l-4 border-gray-400 opacity-75',
      },
    };
    return styles[status] || styles.ended;
  }

  getTimeRemaining(contest: any): string {
    const now = new Date().getTime();
    const startTime = new Date(contest.startTime).getTime();
    const endTime = new Date(contest.endTime).getTime();

    if (now < startTime) {
      const days = Math.floor((startTime - now) / (1000 * 60 * 60 * 24));
      return `Starts in ${days} days`;
    }
    if (now < endTime) {
      const days = Math.floor((endTime - now) / (1000 * 60 * 60 * 24));
      return `${days} days remaining`;
    }
    return 'Contest ended';
  }
}
