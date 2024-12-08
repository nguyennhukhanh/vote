import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AdminApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import { formatDate } from '../../common/utils/time.util';
import { environment } from '../../environments/environment.development';
import { StoreService } from '../services/store.service';

interface IAdminResponse {
  items: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdBy: {
      id: number;
      email: string;
      fullName: string;
    };
    createdAt: string;
    updatedAt: string;
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
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.sass',
})
export class AdminComponent implements OnInit {
  admins: IAdminResponse = {
    items: [],
    meta: {
      itemCount: 0,
      totalItems: 0,
      itemsPerPage: 10,
      totalPages: 0,
      currentPage: 1,
    },
  };

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
    await this.loadAdmins();
  }

  async loadAdmins() {
    this.isLoading = true;
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
          `${environment.apiUrl}${AdminApiEnum.PREFIX}?${queryParams}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.admins = response.data;
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.loadAdmins();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAdmins();
  }

  clearFilters() {
    this.search = '';
    this.fromDate = '';
    this.toDate = '';
    this.onSearch();
  }

  getPageNumbers(): number[] {
    const totalPages = this.admins.meta.totalPages;
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
