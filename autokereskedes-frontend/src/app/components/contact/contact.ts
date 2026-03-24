import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  contactInfo = [
    {
      label: 'Értékesítés',
      phone: '+36 30 123 4567',
      href: 'tel:+36301234567',
      desc: 'Eladó járművekkel kapcsolatos érdeklődés'
    },
    {
      label: 'Bérlés',
      phone: '+36 30 987 6543',
      href: 'tel:+36309876543',
      desc: 'Bérlési ajánlatok és foglalások'
    }
  ];
}