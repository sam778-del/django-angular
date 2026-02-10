import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
      <div class="flex items-center">
        <!-- Optional search bar or breadcrumb -->
        <h1 class="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- Notification Bell -->
        <button class="text-gray-500 hover:text-gray-700 focus:outline-none">
          <span class="sr-only">Notifications</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <!-- Profile Dropdown (Simplified) -->
        <div class="relative flex items-center space-x-2 cursor-pointer" (click)="logout()">
          <div class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
            U
          </div>
          <span class="text-sm font-medium text-gray-700 hover:text-gray-900">Logout</span>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  constructor(public authService: AuthService) { }
  logout() {
    this.authService.logout();
  }
}
