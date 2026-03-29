import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CarList } from './components/car-list/car-list';
import { CarDetail } from './components/car-detail/car-detail';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';
import { Nopage } from './components/nopage/nopage';
import { Login } from './components/admin/login/login';
import { Dashboard } from './components/admin/dashboard/dashboard';
import { CarManager } from './components/admin/car-manager/car-manager';
import { CarForm } from './components/admin/car-form/car-form';
import { RentalManager } from './components/admin/rental-manager/rental-manager';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cars', component: CarList },
  { path: 'cars/:id', component: CarDetail },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'admin/login', component: Login },
  {
    path: 'admin/dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'admin/cars',
    component: CarManager,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['superadmin', 'car_manager', 'viewer'] }
  },
  {
    path: 'admin/cars/new',
    component: CarForm,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['superadmin', 'car_manager'] }
  },
  {
    path: 'admin/cars/edit/:id',
    component: CarForm,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['superadmin', 'car_manager'] }
  },
  {
    path: 'admin/rentals',
    component: RentalManager,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['superadmin', 'rental_manager'] }
  },
  { path: '**', component: Nopage }
];