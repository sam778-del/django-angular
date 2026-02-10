import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="flex flex-col w-64 h-screen px-4 py-8 overflow-y-auto bg-white border-r border-gray-200">
      <div class="flex items-center justify-center mb-8">
        <span class="text-2xl font-bold text-gray-800">Prisco</span>
      </div>

      <nav class="flex-1 space-y-2">
        <a routerLink="/dashboard" routerLinkActive="bg-gray-100 text-gray-900" class="flex items-center px-4 py-2.5 text-gray-700 transition-colors duration-200 transform rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 hover:text-gray-900">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="mx-4 font-medium">Dashboard</span>
        </a>

        <a routerLink="/organizations" routerLinkActive="bg-gray-100 text-gray-900" class="flex items-center px-4 py-2.5 text-gray-700 transition-colors duration-200 transform rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 hover:text-gray-900">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="mx-4 font-medium">Organizations</span>
        </a>

        <a routerLink="/users" routerLinkActive="bg-gray-100 text-gray-900" class="flex items-center px-4 py-2.5 text-gray-700 transition-colors duration-200 transform rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 hover:text-gray-900">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="mx-4 font-medium">Users</span>
        </a>

        <a routerLink="/projects" routerLinkActive="bg-gray-100 text-gray-900" class="flex items-center px-4 py-2.5 text-gray-700 transition-colors duration-200 transform rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 hover:text-gray-900">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span class="mx-4 font-medium">Projects</span>
        </a>
        
        <a routerLink="/records" routerLinkActive="bg-gray-100 text-gray-900" class="flex items-center px-4 py-2.5 text-gray-700 transition-colors duration-200 transform rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 hover:text-gray-900">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="mx-4 font-medium">Records</span>
        </a>
      </nav>

      <div class="mt-auto">
        <div class="flex items-center px-4 -mx-2 mb-4">
           <!-- Footer content like Help or Logout could be here -->
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent { }
