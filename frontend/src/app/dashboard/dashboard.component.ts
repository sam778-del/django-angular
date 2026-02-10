import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Stats Grid -->
      <!-- Recent Activity Section -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 border-b pb-4 mb-4">Recent Activity</h3>
        <p class="text-gray-500">No recent activity found.</p>
      </div>
    </div>
  `
})
export class DashboardComponent { }
