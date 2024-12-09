import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { firstValueFrom } from 'rxjs';

import { ContestApiEnum } from '../../common/enums/api.enum';
import { environment } from '../../environments/environment.development';
import { StoreService } from '../services/store.service';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface ApiResponse {
  meta: {
    status: number;
    message: string;
  };
  data: ChartData;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.sass',
})
export class DashboardComponent implements OnInit {
  fromDate: string = '';
  toDate: string = '';
  isLoading: boolean = false;
  private chart: Chart | null = null;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
  ) {}

  ngOnInit() {
    this.fetchChartData();
  }

  private async fetchChartData() {
    this.isLoading = true;
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const queryParams = new URLSearchParams();

      if (this.fromDate) queryParams.append('fromDate', this.fromDate);
      if (this.toDate) queryParams.append('toDate', this.toDate);

      const response = await firstValueFrom(
        this.http.get<ApiResponse>(
          `${environment.apiUrl}${ContestApiEnum.PREFIX}/statistics?${queryParams}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.createChart(response.data);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    this.fetchChartData();
  }

  clearFilters() {
    this.fromDate = '';
    this.toDate = '';
    this.fetchChartData();
  }

  private createChart(data: ChartData) {
    const ctx = document.getElementById('contestChart') as HTMLCanvasElement;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: dataset.label.includes('Candidates')
            ? 'rgba(54, 162, 235, 0.5)'
            : 'rgba(255, 99, 132, 0.5)',
          borderColor: dataset.label.includes('Candidates')
            ? 'rgba(54, 162, 235, 1)'
            : 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        })),
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
