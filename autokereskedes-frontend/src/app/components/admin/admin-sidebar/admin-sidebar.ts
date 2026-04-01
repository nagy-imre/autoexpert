import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss'
})
export class AdminSidebar implements OnInit {
  currentUser: any;
  menuOpen = true;
  isBrowser: boolean;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.isBrowser) {
      // 1300px alatt alapból összecsukva indul
      this.menuOpen = window.innerWidth > 1300;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      // Automatikus csukás, ha a felhasználó kisebbre húzza az ablakot
      if (window.innerWidth <= 1300 && this.menuOpen) {
        this.menuOpen = false;
      }
    }
  }

  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onLinkClick() {
    if (this.isBrowser && window.innerWidth <= 1300) {
      this.menuOpen = false;
    }
  }
}