import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  team = [
    {
      name: 'Darányi Zsolt',
      role: 'Tulajdonos / Vezérigazgató',
      bio: 'Több mint 25 éves tapasztalattal rendelkezik az autóiparban. Zsolt vezetésével az AutoExpert a régió egyik legmegbízhatóbb kereskedésévé nőtte ki magát.',
      image: 'assets/team/daranyi-zsolt.webp',
      email: 'zsolt.daranyi@autoexpert.com'
    },
    {
      name: 'Kovács Bendegúz',
      role: 'Ügyvezető asszisztens',
      bio: 'Zsolt jobb keze. Bendegúz gondoskodik arról, hogy minden a legmagasabb színvonalon működjön – az ügyfélkiszolgálástól az adminisztrációig.',
      image: 'assets/team/kovacs-bendeguz.webp',
      email: 'bendeguz.kovacs@autoexpert.com'

    },
    {
      name: 'Ifj. Rácz Lajos',
      role: 'Értékesítési vezető',
      bio: 'Lajos szenvedélyesen szereti az autókat. Precíz szemmel választja ki a kínálatba kerülő járműveket, és mindig megtalálja az ügyfélnek legmegfelelőbb ajánlatot.',
      image: 'assets/team/ifj-racz-lajos.webp',
      email: 'lajos.racz.ifj@autoexpert.com'

    },
    {
      name: 'Vásárhelyi Gábor',
      role: 'Műszaki szakértő',
      bio: 'Gábor minden autó "orvosa". Alapos műszaki vizsgálatainak köszönhetően csak kifogástalan állapotú járművek kerülnek kínálatunkba.',
      image: 'assets/team/vasarhelyi-gabor.webp',
      email: 'gabor.vasarhelyi@autoexpert.com'

    },
    {
      name: 'Popovics Nikolett',
      role: 'Ügyfélkapcsolati menedzser',
      bio: 'Nikolett az a személy, akit az ügyfelek először megismernek. Mosolya és szakértelme garantálja, hogy mindenki elégedetten távozzon.',
      image: 'assets/team/popovics-nikolett.webp',
      email: 'nikolett.popovics@autoexpert.com'

    },
    {
      name: 'Szentgyörgyi Péter',
      role: 'Bérlési koordinátor',
      bio: 'Péter felel a bérlési folyamat zökkenőmentes lebonyolításáért. Pontossága és rugalmassága miatt az ügyfelek mindig számíthatnak rá.',
      image: 'assets/team/szentgyorgyi-peter.webp',
      email: 'peter.szentgyorgyi@autoexpert.com'
    },
    {
      name: 'Borbély Réka',
      role: 'Értékesítési asszisztens',
      bio: 'Réka energiája és lelkesedése fertőző. Minden ügyféllel egyénre szabottan foglalkozik, és mindig megtalálja a legjobb megoldást.',
      image: 'assets/team/borbely-reka.webp',
      email: 'reka.borbely@autoexpert.com'
    }
  ];
}