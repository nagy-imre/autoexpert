import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CarList } from './components/car-list/car-list';
import { CarDetail } from './components/car-detail/car-detail';
import { AddCar } from './components/add-car/add-car';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';
import { Nopage } from './components/nopage/nopage';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cars', component: CarList },
  { path: 'cars/:id', component: CarDetail },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'admin/add', component: AddCar },
  { path: '**', component: Nopage }
];