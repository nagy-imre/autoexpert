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
import { UserManager } from './components/admin/user-manager/user-manager';
import { AdminSidebar } from './components/admin/admin-sidebar/admin-sidebar';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  // Publikus oldalak
  { path: '', component: Home },
  { path: 'cars', component: CarList },
  { path: 'cars/:id', component: CarDetail },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },

  // Admin bejelentkezés (NINCS oldalsáv, különálló lap)
  { path: 'admin/login', component: Login },

  // --- ADMIN KERETRENDSZER (Szülő-Gyermek kapcsolat) ---
  {
    path: 'admin',
    component: AdminSidebar, // Ő a fő keret (benne a menü és a router-outlet)
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { 
        path: 'users', 
        component: UserManager, 
        canActivate: [roleGuard], 
        data: { roles: ['superadmin'] } 
      },
      { 
        path: 'cars', 
        component: CarManager, 
        canActivate: [roleGuard], 
        data: { roles: ['superadmin', 'car_manager', 'viewer'] } 
      },
      { 
        path: 'cars/new', 
        component: CarForm, 
        canActivate: [roleGuard], 
        data: { roles: ['superadmin', 'car_manager'] } 
      },
      { 
        path: 'cars/edit/:id', 
        component: CarForm, 
        canActivate: [roleGuard], 
        data: { roles: ['superadmin', 'car_manager'] } 
      },
      { 
        path: 'rentals', 
        component: RentalManager, 
        canActivate: [roleGuard], 
        data: { roles: ['superadmin', 'rental_manager'] } 
      }
    ]
  },

  // Minden más esetben 404
  { path: '**', component: Nopage }
];