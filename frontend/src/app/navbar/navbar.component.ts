import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.sass',
})
export class NavbarComponent {
  isMenuOpen = false;
  isProfileMenuOpen = false;
  userAvatar: string | null = null;
  notifications = 2; // Mock data, should come from a service

  constructor(
    @Inject(Router) private router: Router,
    @Inject(StoreService) private storeService: StoreService,
  ) {
    // Load user data
    this.loadUserData();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  async loadUserData(): Promise<void> {
    try {
      const userData = { avatarUrl: 'assets/images/default-avatar.png' };
      this.userAvatar =
        userData?.avatarUrl || 'assets/images/default-avatar.png';
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  logout(): void {
    this.storeService.clearTokens();
    this.router.navigate(['/auth']);
  }

  // Close profile menu when clicking outside
  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }
}
