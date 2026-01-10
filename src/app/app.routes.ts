import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { RestaurantList } from './pages/restaurant-list/restaurant-list';
import { RestaurantDetail } from './pages/restaurant-detail/restaurant-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/restaurants', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'restaurants', component: RestaurantList },
  { path: 'restaurants/:id', component: RestaurantDetail },
  { path: '**', redirectTo: '/restaurants' }
];

