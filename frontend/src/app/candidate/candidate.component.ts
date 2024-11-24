import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CandidateApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import { environment } from '../../environments/environment.development';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate.component.html',
  styleUrl: './candidate.component.sass',
})
export class CandidateComponent implements OnInit {
  candidates: any = { items: [], meta: {} };
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

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
    @Inject(ActivatedRoute) private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = parseInt(params['contestId'], 10);
      if (!isNaN(id)) {
        this.voteId = id;
        this.loadCandidates();
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

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCandidates();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCandidates();
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
}
