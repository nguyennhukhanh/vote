import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

import { GroupApiEnum } from '../../common/enums/api.enum';
import { environment } from '../../environments/environment.development';
import { StoreService } from '../services/store.service';

interface AdminProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass'],
})
export class ProfileComponent implements OnInit {
  defaultAvatar = 'assets/images/default-avatar.png';
  profile: AdminProfile | null = null;
  isLoading: boolean = true;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
    @Inject(Router) public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}${GroupApiEnum.Admin}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      this.profile = response.data;
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error loading profile');
    } finally {
      this.isLoading = false;
    }
  }
}
