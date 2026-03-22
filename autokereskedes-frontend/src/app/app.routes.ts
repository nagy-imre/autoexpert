import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CarList } from './components/car-list/car-list';
import { AddCar } from './components/add-car/add-car';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cars', component: CarList },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'admin/add', component: AddCar },
  { path: '**', redirectTo: '' }
];