import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/restaurants', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  },
  {
    path: 'restaurants',
    loadComponent: () => import('./pages/restaurant-list/restaurant-list').then(m => m.RestaurantList)
  },
  {
    path: 'restaurants/new',
    loadComponent: () => import('./pages/restaurant-create/restaurant-create').then(m => m.RestaurantCreate),
    canActivate: [authGuard]
  },
  {
    path: 'restaurants/:id',
    loadComponent: () => import('./pages/restaurant-detail/restaurant-detail').then(m => m.RestaurantDetail)
  },
  {
    path: 'recommendations',
    loadComponent: () => import('./pages/recommendations/recommendations').then(m => m.Recommendations),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/restaurants' }
];

