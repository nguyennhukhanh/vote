import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

import { GroupApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import { environment } from '../../environments/environment.development';
import { StoreService } from '../services/store.service';

interface UserProfile {
  id: number;
  email: string | null;
  fullName: string | null;
  walletAddress: string | null;
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
  imports: [CommonModule, ReactiveFormsModule],
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
  updateForm: FormGroup;
  isEditing: boolean = false;
  isSubmitting: boolean = false;
  showAvatarDialog: boolean = false;
  previewImage: string | null = null;
  selectedFile: File | null = null;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
    @Inject(Router) public router: Router,
    @Inject(FormBuilder)
    private fb: FormBuilder,
  ) {
    this.updateForm = this.fb.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      email: ['', [Validators.email]],
      walletAddress: ['', [Validators.pattern(/^0x[a-fA-F0-9]{40}$/)]],
    });
  }

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

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.profile) {
      this.updateForm.patchValue({
        fullName: this.profile.fullName,
        email: this.profile.email,
        walletAddress: this.profile.walletAddress,
      });
    }
  }

  async handleFileInput(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      if (!/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)) {
        toast.error('Invalid file format');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target?.result as string;
        this.showAvatarDialog = true;
      };
      reader.readAsDataURL(file);
    }
  }

  async updateAvatar(): Promise<void> {
    if (!this.selectedFile) {
      toast.error('No file selected');
      return;
    }

    try {
      this.isSubmitting = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const accessToken = this.storeService.getTokens().accessToken;
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}${GroupApiEnum.User}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      await this.loadProfile();
      this.showAvatarDialog = false;
      this.previewImage = null;
      this.selectedFile = null;
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update avatar');
    } finally {
      this.isSubmitting = false;
    }
  }

  closeAvatarDialog(): void {
    this.showAvatarDialog = false;
    this.previewImage = null;
    this.selectedFile = null;
  }

  async updateProfile(): Promise<void> {
    const formValue = this.updateForm.value;
    const hasAnyValue = Object.values(formValue).some(
      (value) => value !== null && value !== '',
    );

    if (hasAnyValue && this.updateForm.invalid) {
      toast.error('Please check your input');
      return;
    }

    try {
      this.isSubmitting = true;
      const formData = new FormData();
      let hasChanges = false;

      Object.keys(formValue).forEach((key) => {
        const value = formValue[key];
        if (value && value !== this.profile?.[key as keyof UserProfile]) {
          formData.append(key, value);
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        this.toggleEditMode();
        return;
      }

      const accessToken = this.storeService.getTokens().accessToken;
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}${GroupApiEnum.User}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      await this.loadProfile();
      this.toggleEditMode();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.error?.meta?.message || 'Failed to update profile');
    } finally {
      this.isSubmitting = false;
    }
  }

  getAvatarUrl(path: string | null | undefined): string {
    if (!path) return this.defaultAvatar;
    return `${environment.defaultUrl}${path}`;
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
