import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AppShellComponent } from './core/layout/app-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/profile/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./features/members/members-page.component').then((m) => m.MembersPageComponent)
      },
      {
        path: 'members/new',
        loadComponent: () => import('./features/members/member-form.component').then((m) => m.MemberFormComponent)
      },
      {
        path: 'members/:id',
        loadComponent: () => import('./features/members/member-detail.component').then((m) => m.MemberDetailComponent)
      },
      {
        path: 'meetings',
        loadComponent: () => import('./features/meetings/meetings-page.component').then((m) => m.MeetingsPageComponent)
      },
      {
        path: 'meetings/:id',
        loadComponent: () => import('./features/meetings/meeting-detail.component').then((m) => m.MeetingDetailComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance-page.component').then((m) => m.AttendancePageComponent)
      },
      {
        path: 'absence-requests',
        loadComponent: () => import('./features/absence-requests/absence-requests-page.component').then((m) => m.AbsenceRequestsPageComponent)
      },
      {
        path: 'tontine',
        loadComponent: () => import('./features/tontine/tontine-page.component').then((m) => m.TontinePageComponent)
      },
      {
        path: 'tontine/:id',
        loadComponent: () => import('./features/tontine/tontine-detail.component').then((m) => m.TontineDetailComponent)
      },
      {
        path: 'contributions',
        loadComponent: () => import('./features/contributions/contributions-page.component').then((m) => m.ContributionsPageComponent)
      },
      {
        path: 'beneficiaries',
        loadComponent: () => import('./features/beneficiaries/beneficiaries-page.component').then((m) => m.BeneficiariesPageComponent)
      },
      {
        path: 'penalties',
        loadComponent: () => import('./features/penalties/penalties-page.component').then((m) => m.PenaltiesPageComponent)
      },
      {
        path: 'charity-fund',
        loadComponent: () => import('./features/charity-fund/charity-fund-page.component').then((m) => m.CharityFundPageComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects-page.component').then((m) => m.ProjectsPageComponent)
      },
      {
        path: 'decisions',
        loadComponent: () => import('./features/decisions/decisions-page.component').then((m) => m.DecisionsPageComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports-page.component').then((m) => m.ReportsPageComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications-page.component').then((m) => m.NotificationsPageComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
