import type { Routes } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { CandidateComponent } from './candidate/candidate.component';
import { ContestComponent } from './contest/contest.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { UserComponent } from './user/user.component';
import { VoteComponent } from './vote/vote.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'contest', component: ContestComponent },
      { path: 'contest/:contestId/candidate', component: CandidateComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vote', component: VoteComponent },
      { path: 'user', component: UserComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
