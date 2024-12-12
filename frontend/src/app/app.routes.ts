import type { Routes } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { CandidateComponent } from './candidate/candidate.component';
import { ContestComponent } from './contest/contest.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { ResultComponent } from './result/result.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'contest', component: ContestComponent },
  { path: 'contest/:contestId/candidate', component: CandidateComponent },
  { path: 'results', component: ResultComponent },
  { path: '', component: HomeComponent },
];
