import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
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
  userAvatar: string | null = null;
  isSidebarOpen = false;

  constructor(
    @Inject(Router) private router: Router,
    @Inject(StoreService) private storeService: StoreService,
  ) {
    this.loadUserData();
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

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth > 768) {
      this.isSidebarOpen = true;
    }
  }

  logout(): void {
    this.storeService.clearTokens();
    this.router.navigate(['/auth']);
  }
}
