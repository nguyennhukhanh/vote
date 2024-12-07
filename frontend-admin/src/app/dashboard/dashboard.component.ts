import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Move existing dashboard content from home.component.html here -->
    <div class="bg-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p class="text-gray-600">Welcome back, Administrator</p>
          </div>
          <div class="flex items-center space-x-4">
            <button class="p-2 text-gray-600 hover:text-gray-900">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
            </button>
            <div class="flex items-center space-x-2 cursor-pointer">
              <img
                src="assets/images/admin-avatar.png"
                alt="Admin"
                class="w-8 h-8 rounded-full"
              />
              <span class="text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section bg-white py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="bg-blue-50 rounded-lg p-6">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              <span id="totalContests">0</span>
            </div>
            <div class="text-gray-600">Total Contests</div>
          </div>
          <div class="bg-green-50 rounded-lg p-6">
            <div class="text-3xl font-bold text-green-600 mb-2">
              <span id="activeContests">0</span>
            </div>
            <div class="text-gray-600">Active Contests</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-6">
            <div class="text-3xl font-bold text-purple-600 mb-2">
              <span id="totalVotes">0</span>
            </div>
            <div class="text-gray-600">Total Votes</div>
          </div>
          <div class="bg-orange-50 rounded-lg p-6">
            <div class="text-3xl font-bold text-orange-600 mb-2">
              <span id="totalParticipants">0</span>
            </div>
            <div class="text-gray-600">Total Users</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="py-8 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Contest Management -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Contest Management
            </h3>
            <div class="space-y-2">
              <a
                routerLink="/contests"
                class="flex items-center text-gray-700 hover:text-blue-600"
              >
                <span class="mr-2">📊</span> View All Contests
              </a>
              <a
                routerLink="/contests/create"
                class="flex items-center text-gray-700 hover:text-blue-600"
              >
                <span class="mr-2">➕</span> Create New Contest
              </a>
            </div>
          </div>

          <!-- Candidate Management -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Candidate Management
            </h3>
            <div class="space-y-2">
              <a
                routerLink="/candidates"
                class="flex items-center text-gray-700 hover:text-blue-600"
              >
                <span class="mr-2">👥</span> View All Candidates
              </a>
              <a
                routerLink="/candidates/create"
                class="flex items-center text-gray-700 hover:text-blue-600"
              >
                <span class="mr-2">➕</span> Add New Candidate
              </a>
            </div>
          </div>

          <!-- User Management -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              User Management
            </h3>
            <div class="space-y-2">
              <a
                routerLink="/users"
                class="flex items-center text-gray-700 hover:text-blue-600"
              >
                <span class="mr-2">👤</span> View All Users
              </a>
              <a
                routerLink="/users/roles"
                class="flex items-center text-gray-700 hover:text-blue-600"
              >
                <span class="mr-2">🔑</span> Manage Roles
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  // Move relevant code from HomeComponent here
}
