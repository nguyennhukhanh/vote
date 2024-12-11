import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { firstValueFrom } from 'rxjs';

import { ContestApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
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
  // Separate date filters for different charts
  overviewFromDate: string = '';
  overviewToDate: string = '';
  timelineFromDate: string = '';
  timelineToDate: string = '';

  isLoading: boolean = false;
  private chart: Chart | null = null;
  private pieChart: Chart | null = null;
  private stackedChart: Chart | null = null;
  selectedContestId: number | null = null;
  contests: any[] = [];
  dateError: string = '';

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
  ) {}

  ngOnInit() {
    this.fetchContests();
    this.fetchOverviewData();
  }

  private async fetchContests() {
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const response = await firstValueFrom(
        this.http.get<IResponse>(
          `${environment.apiUrl}${ContestApiEnum.PREFIX}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.contests = response.data.items;
      if (this.contests.length > 0) {
        this.selectedContestId = this.contests[0].id;
        this.fetchPieChart();
        this.fetchTimelineData();
      }
    } catch (error) {
      console.error('Error loading contests:', error);
    }
  }

  fetchOverviewData() {
    this.isLoading = true;
    const params = new URLSearchParams();
    if (this.overviewFromDate) params.append('fromDate', this.overviewFromDate);
    if (this.overviewToDate) params.append('toDate', this.overviewToDate);
    this.fetchChartData(params);
  }

  fetchTimelineData() {
    if (!this.selectedContestId) return;

    if (!this.validateDates(this.timelineFromDate, this.timelineToDate)) {
      return;
    }

    const params = new URLSearchParams();
    if (this.timelineFromDate) params.append('fromDate', this.timelineFromDate);
    if (this.timelineToDate) params.append('toDate', this.timelineToDate);
    this.fetchStackedChart(params);
  }

  async fetchContestDetails() {
    if (!this.selectedContestId) return;
    try {
      this.isLoading = true;
      // Fetch both pie and stacked charts in parallel
      await Promise.all([this.fetchPieChart(), this.fetchTimelineData()]);
    } catch (error) {
      console.error('Error loading contest details:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onContestChange() {
    if (this.selectedContestId) {
      // Fetch both charts when contest changes
      this.fetchPieChart();
      this.fetchTimelineData();
    }
  }

  // Update existing methods to use passed parameters
  private async fetchChartData(params: URLSearchParams) {
    try {
      const accessToken = this.storeService.getTokens().accessToken;

      const response = await firstValueFrom(
        this.http.get<ApiResponse>(
          `${environment.apiUrl}${ContestApiEnum.PREFIX}/statistics?${params}`,
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

  public async fetchPieChart() {
    if (!this.selectedContestId) return;
    try {
      this.isLoading = true;
      const accessToken = this.storeService.getTokens().accessToken;
      const response = await firstValueFrom(
        this.http.get<ApiResponse>(
          `${environment.apiUrl}${ContestApiEnum.PREFIX}/${this.selectedContestId}/pie-chart`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.createPieChart(response.data);
    } catch (error) {
      console.error('Error loading pie chart:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchStackedChart(params: URLSearchParams) {
    try {
      this.isLoading = true;
      const accessToken = this.storeService.getTokens().accessToken;

      const response = await firstValueFrom(
        this.http.get<ApiResponse>(
          `${environment.apiUrl}${ContestApiEnum.PREFIX}/${this.selectedContestId}/stacked-chart${params.toString() ? '?' + params.toString() : ''}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      this.createStackedChart(response.data);
    } catch (error) {
      console.error('Error loading stacked chart:', error);
    } finally {
      this.isLoading = false;
    }
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

  private createPieChart(data: ChartData) {
    const ctx = document.getElementById('votePieChart') as HTMLCanvasElement;
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: data.datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Vote Distribution',
          },
        },
      },
    });
  }

  private createStackedChart(data: ChartData) {
    const ctx = document.getElementById(
      'voteStackedChart',
    ) as HTMLCanvasElement;
    if (this.stackedChart) {
      this.stackedChart.destroy();
    }

    // Define a fixed color palette
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#C9CBCF',
      '#7BC225',
      '#B94A48',
    ];

    // Assign colors to datasets
    const datasets = data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: colors[index % colors.length],
    }));

    this.stackedChart = new Chart(ctx, {
      type: 'bar',
      data: { ...data, datasets },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Votes Over Time',
          },
        },
      },
    });
  }

  validateDates(startDate: string, endDate: string): boolean {
    if (!startDate && !endDate) return true;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        this.dateError = 'Start date cannot be later than end date';
        return false;
      }
    }

    this.dateError = '';
    return true;
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.stackedChart) {
      this.stackedChart.destroy();
    }
  }
}
