import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { AdminSidebar } from "./components/admin/admin-sidebar/admin-sidebar";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer, AdminSidebar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})

export class App {
  isAdminRoute = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAdminRoute = event.urlAfterRedirects.includes('/admin');
      }
    });
  }
}