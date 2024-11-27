import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { GroupApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import { environment } from '../../environments/environment.development';
import { StoreService } from '../services/store.service';

interface UserProfile {
  id: number;
  email: string | null;
  fullName: string | null;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalVotes: number;
  totalContests: number;
  totalCreated: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass'],
})
export class ProfileComponent implements OnInit {
  defaultAvatar: string = 'assets/images/default-avatar.png';
  profile: UserProfile | null = null;
  isLoading: boolean = true;
  activeTab: string = 'Votes';
  stats: UserStats = {
    totalVotes: 0,
    totalContests: 0,
    totalCreated: 0,
  };

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
    @Inject(Router) public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadUserStats();
  }

  async loadProfile(): Promise<void> {
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const response = await firstValueFrom(
        this.http.get<IResponse>(`${environment.apiUrl}${GroupApiEnum.User}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      this.profile = response.data;
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadUserStats(): Promise<void> {
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const response = await firstValueFrom(
        this.http.get<IResponse>(
          `${environment.apiUrl}${GroupApiEnum.User}/stats`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.stats = response.data;
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  async updateAvatar(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const accessToken = this.storeService.getTokens().accessToken;
        await firstValueFrom(
          this.http.post(
            `${environment.apiUrl}${GroupApiEnum.User}/avatar`,
            formData,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          ),
        );

        await this.loadProfile();
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  }

  get totalVotes(): number {
    return this.stats.totalVotes;
  }

  get totalContests(): number {
    return this.stats.totalContests;
  }

  get totalCreated(): number {
    return this.stats.totalCreated;
  }
}
