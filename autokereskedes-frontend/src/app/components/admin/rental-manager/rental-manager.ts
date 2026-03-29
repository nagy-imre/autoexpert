import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { RentalService } from '../../../services/rental';
import { CarService } from '../../../services/car';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import Swal from 'sweetalert2';

// Magyar fordítások
const STATUS_LABELS: Record<string, string> = {
  pending:   'Függőben',
  active:    'Aktív',
  completed: 'Lezárt',
  cancelled: 'Törölt'
};

const FUEL_LABELS: Record<string, string> = {
  petrol:   'Benzin', gasoline: 'Benzin',
  diesel:   'Dízel',  electric: 'Elektromos',
  hybrid:   'Hibrid', lpg: 'LPG'
};

const TRANSMISSION_LABELS: Record<string, string> = {
  manual: 'Manuális', automatic: 'Automata'
};

const DRIVE_LABELS: Record<string, string> = {
  FWD: 'Első kerékhajtás', RWD: 'Hátsó kerékhajtás',
  AWD: 'Összkerékhajtás',  '4WD': 'Összkerékhajtás'
};

const BODY_LABELS: Record<string, string> = {
  sedan: 'Sedan', suv: 'SUV', kombi: 'Kombi',
  hatchback: 'Ferdehátú', coupe: 'Kupé',
  cabrio: 'Kabrió', van: 'Furgon', pickup: 'Pickup'
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'Új', excellent: 'Kiváló', normal: 'Normál', damaged: 'Sérült'
};

const SERVICE_BOOK_LABELS: Record<string, string> = {
  full_dealer: 'Teljes márkaszerviz', partial: 'Részleges', none: 'Nincs'
};

@Component({
  selector: 'app-rental-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebar],
  templateUrl: './rental-manager.html',
  styleUrl: './rental-manager.scss'
})
export class RentalManager implements OnInit {
  rentals: any[] = [];
  filteredRentals: any[] = [];
  loading = true;

  searchQuery: string = '';
  statusFilter: string = 'all';

  constructor(
    private authService: AuthService,
    private rentalService: RentalService,
    private carService: CarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRentals();
  }

  loadRentals(): void {
    this.loading = true;
    this.rentalService.getRentals().subscribe({
      next: (data) => {
        this.rentals = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.filteredRentals = this.rentals.filter(rental => {
      const matchesSearch =
        rental.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        rental.customerEmail.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || rental.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  // ─── Segédfüggvények ──────────────────────────────────────────────────────

  private hu(n: number): string {
    return n.toLocaleString('hu-HU');
  }

  private fmt(d: string): string {
    return d.replace(/-/g, '.');
  }

  private tr(map: Record<string, string>, val: string | null | undefined): string {
    if (!val) return '—';
    return map[val.toLowerCase()] ?? map[val] ?? val;
  }

  private row(label: string, value: string, highlight = false): string {
    return `<tr>
      <td style="color:#aaa;font-size:0.77rem;padding:0.27rem 0.5rem;text-align:left;white-space:nowrap;">${label}</td>
      <td style="font-weight:${highlight ? '700' : '600'};font-size:${highlight ? '0.9rem' : '0.81rem'};
                 color:${highlight ? '#c9a84c' : '#1a1a1a'};padding:0.27rem 0.5rem;text-align:right;">${value}</td>
    </tr>`;
  }

  private section(text: string): string {
    return `<p style="font-size:0.67rem;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;
                      color:#bbb;margin:0.85rem 0 0.25rem;border-bottom:1px solid #f0f0f0;
                      padding-bottom:0.25rem;">${text}</p>`;
  }

  // ─── Új bérlés — 4 lépéses wizard ────────────────────────────────────────

  async openNewRentalModal(): Promise<void> {
    let cars: any[] = [];
    try {
      cars = await this.carService.getCars('rent').toPromise() ?? [];
    } catch {
      Swal.fire('Hiba', 'A járművek betöltése sikertelen.', 'error');
      return;
    }

    // ── 1/4: Ügyfél adatok ────────────────────────────────────────────────
    const step1 = await Swal.fire({
      title: '<span style="font-size:1.05rem;font-weight:700;">Új bérlés — 1/4</span>',
      html: `
        <p style="color:#aaa;font-size:0.8rem;margin:0 0 1.1rem;">Ügyfél személyes adatai</p>
        <input id="swal-name"  class="swal2-input" placeholder="Teljes név *" style="margin-bottom:0.5rem;">
        <input id="swal-email" class="swal2-input" type="email" placeholder="E-mail cím *" style="margin-bottom:0.5rem;">
        <input id="swal-phone" class="swal2-input" type="tel"   placeholder="Telefonszám *">
      `,
      showCancelButton: true,
      confirmButtonText: 'Következő →',
      cancelButtonText: 'Mégse',
      confirmButtonColor: '#c9a84c',
      cancelButtonColor: '#aaa',
      focusConfirm: false,
      preConfirm: () => {
        const name  = (document.getElementById('swal-name')  as HTMLInputElement).value.trim();
        const email = (document.getElementById('swal-email') as HTMLInputElement).value.trim();
        const phone = (document.getElementById('swal-phone') as HTMLInputElement).value.trim();
        if (!name || !email || !phone) {
          Swal.showValidationMessage('Minden mező kitöltése kötelező!'); return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Adj meg érvényes e-mail címet!'); return false;
        }
        return { name, email, phone };
      }
    });
    if (!step1.isConfirmed) return;
    const customerData = step1.value;

    // ── 2/4: Jármű kiválasztása ───────────────────────────────────────────
    const carOptions = cars
      .map(c => `<option value="${c.id}">${c.brand} ${c.model} — ${c.licensePlate} (${this.hu(c.rentPricePerDay ?? 0)} Ft/nap)</option>`)
      .join('');

    const step2 = await Swal.fire({
      title: '<span style="font-size:1.05rem;font-weight:700;">Új bérlés — 2/4</span>',
      html: `
        <p style="color:#aaa;font-size:0.8rem;margin:0 0 1.1rem;">Jármű kiválasztása</p>
        <select id="swal-car" class="swal2-input" style="margin-bottom:0;">
          <option value="">— Válassz járművet —</option>
          ${carOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Következő →',
      cancelButtonText: '← Vissza',
      confirmButtonColor: '#c9a84c',
      cancelButtonColor: '#aaa',
      focusConfirm: false,
      preConfirm: () => {
        const carId = (document.getElementById('swal-car') as HTMLSelectElement).value;
        if (!carId) { Swal.showValidationMessage('Kérlek válassz járművet!'); return false; }
        return { carId: Number(carId), car: cars.find(c => c.id == carId) };
      }
    });
    if (!step2.isConfirmed) { this.openNewRentalModal(); return; }
    const { carId, car } = step2.value;

    // ── 3/4: Időszak megadása ─────────────────────────────────────────────
    const today       = new Date().toISOString().split('T')[0];
    const pricePerDay = car?.rentPricePerDay ?? 0;

    const step3 = await Swal.fire({
      title: '<span style="font-size:1.05rem;font-weight:700;">Új bérlés — 3/4</span>',
      html: `
        <p style="color:#aaa;font-size:0.8rem;margin:0 0 1.1rem;">Bérlési időszak megadása</p>
        <label style="font-size:0.78rem;color:#555;display:block;text-align:left;margin-bottom:0.2rem;">Kezdő dátum *</label>
        <input id="swal-start" class="swal2-input" type="date" min="${today}" style="margin-bottom:0.8rem;">
        <label style="font-size:0.78rem;color:#555;display:block;text-align:left;margin-bottom:0.2rem;">Befejező dátum *</label>
        <input id="swal-end" class="swal2-input" type="date" min="${today}" style="margin-bottom:0;">
      `,
      showCancelButton: true,
      confirmButtonText: 'Összesítő →',
      cancelButtonText: '← Vissza',
      confirmButtonColor: '#c9a84c',
      cancelButtonColor: '#aaa',
      focusConfirm: false,
      preConfirm: () => {
        const startDate = (document.getElementById('swal-start') as HTMLInputElement).value;
        const endDate   = (document.getElementById('swal-end')   as HTMLInputElement).value;
        if (!startDate || !endDate) {
          Swal.showValidationMessage('Mindkét dátum megadása kötelező!'); return false;
        }
        if (new Date(endDate) <= new Date(startDate)) {
          Swal.showValidationMessage('A befejező dátumnak a kezdő dátum után kell lennie!'); return false;
        }
        const days = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
        return { startDate, endDate, days, totalPrice: days * pricePerDay };
      }
    });
    if (!step3.isConfirmed) { this.openNewRentalModal(); return; }
    const { startDate, endDate, days, totalPrice } = step3.value;

    // ── 4/4: Összesítő ────────────────────────────────────────────────────
    const deposit      = car?.deposit       ?? 0;
    const dailyKmLimit = car?.dailyKmLimit  ?? 0;
    const extraKmFee   = car?.extraKmFee    ?? 0;

    const summaryHtml = `
      <div style="text-align:left;font-size:0.82rem;">

        ${this.section('Bérlő adatai')}
        <table style="width:100%;border-collapse:collapse;">
          ${this.row('Név',     customerData.name)}
          ${this.row('E-mail',  customerData.email)}
          ${this.row('Telefon', customerData.phone)}
        </table>

        ${this.section('Jármű adatai')}
        <table style="width:100%;border-collapse:collapse;">
          ${this.row('Autó',     `${car?.brand ?? ''} ${car?.model ?? ''}`)}
          ${this.row('Rendszám', car?.licensePlate ?? '—')}
        </table>
        <div id="car-details-toggle" style="display:flex;align-items:center;gap:0.35rem;cursor:pointer;
             color:#c9a84c;font-size:0.75rem;font-weight:600;margin:0.4rem 0.5rem 0.1rem;user-select:none;">
          <span id="car-details-arrow" style="display:inline-block;transition:transform 0.2s;">▶</span>
          <span>Részletes adatok megjelenítése</span>
        </div>
        <div id="car-details-body" style="display:none;">
          <table style="width:100%;border-collapse:collapse;">
            ${car?.year            ? this.row('Évjárat',        String(car.year))                                   : ''}
            ${car?.bodyType        ? this.row('Karosszéria',    this.tr(BODY_LABELS, car.bodyType))                 : ''}
            ${car?.fuelType        ? this.row('Üzemanyag',      this.tr(FUEL_LABELS, car.fuelType))                 : ''}
            ${car?.transmission    ? this.row('Váltó',          this.tr(TRANSMISSION_LABELS, car.transmission))     : ''}
            ${car?.driveType       ? this.row('Hajtás',         this.tr(DRIVE_LABELS, car.driveType))               : ''}
            ${car?.engineCapacity  ? this.row('Motor',          `${car.engineCapacity} cm³`)                       : ''}
            ${car?.horsepower      ? this.row('Teljesítmény',   `${car.horsepower} LE`)                            : ''}
            ${car?.seats           ? this.row('Férőhely',       `${car.seats} fő`)                                 : ''}
            ${car?.doors           ? this.row('Ajtók száma',    `${car.doors}`)                                    : ''}
            ${car?.color           ? this.row('Szín',           car.color)                                         : ''}
            ${car?.mileage != null ? this.row('Km-óra állás',   `${this.hu(car.mileage)} km`)                      : ''}
            ${car?.condition       ? this.row('Állapot',        this.tr(CONDITION_LABELS, car.condition))           : ''}
            ${car?.serviceBook     ? this.row('Szervizkönyv',   this.tr(SERVICE_BOOK_LABELS, car.serviceBook))      : ''}
            ${car?.isCrashed != null ? this.row('Törésmentes',  car.isCrashed ? 'Nem' : 'Igen')                    : ''}
          </table>
        </div>

        ${this.section('Bérlési feltételek')}
        <table style="width:100%;border-collapse:collapse;">
          ${this.row('Időszak',        `${this.fmt(startDate)} – ${this.fmt(endDate)}`)}
          ${this.row('Bérlési napok',  `${days} nap`)}
          ${this.row('Napi díj',       `${this.hu(pricePerDay)} Ft`)}
          ${dailyKmLimit ? this.row('Napi km-limit',  `${this.hu(dailyKmLimit)} km`)    : ''}
          ${extraKmFee   ? this.row('Túlfutási díj',  `${this.hu(extraKmFee)} Ft/km`)   : ''}
        </table>

        ${this.section('Fizetési összesítő')}
        <table style="width:100%;border-collapse:collapse;">
          ${this.row('Bérleti díj',               `${this.hu(totalPrice)} Ft`, true)}
          ${deposit ? this.row('Kaució (visszatérítendő)', `${this.hu(deposit)} Ft`) : ''}
          <tr><td colspan="2" style="padding:0.3rem 0.5rem;">
            <div style="border-top:2px solid #c9a84c;margin:0.25rem 0;"></div>
          </td></tr>
          ${this.row('Összesen fizetendő', `${this.hu(totalPrice + deposit)} Ft`, true)}
        </table>

      </div>
    `;

    const step4 = await Swal.fire({
      title: '<span style="font-size:1.05rem;font-weight:700;">Összesítő — 4/4</span>',
      html: summaryHtml,
      showCancelButton: true,
      confirmButtonText: '✓ Bérlés rögzítése',
      cancelButtonText: '← Vissza',
      confirmButtonColor: '#c9a84c',
      cancelButtonColor: '#aaa',
      width: '540px'
    });
    if (!step4.isConfirmed) { this.openNewRentalModal(); return; }

    // ── API hívás ─────────────────────────────────────────────────────────
    this.rentalService.createRental({
      customerName:  customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      carId,
      startDate,
      endDate,
      totalPrice
    }).subscribe({
      next: () => {
        Swal.fire({
          title: 'Bérlés rögzítve!',
          html: `<b>${customerData.name}</b> — ${car?.brand ?? ''} ${car?.model ?? ''}<br>
                 ${this.fmt(startDate)} – ${this.fmt(endDate)}<br>
                 <span style="color:#c9a84c;font-weight:700;">${this.hu(totalPrice)} Ft</span>`,
          icon: 'success',
          confirmButtonColor: '#c9a84c'
        });
        this.loadRentals();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Ismeretlen hiba történt.';
        Swal.fire('Hiba', `A bérlés rögzítése sikertelen.<br><small style="color:#aaa;">${msg}</small>`, 'error');
      }
    });
  }

  // ─── Szerkesztés ──────────────────────────────────────────────────────────

  editRental(rental: any): void {
    const validTransitions: Record<string, string[]> = {
      pending:   ['active', 'cancelled'],
      active:    ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    const allowed = validTransitions[rental.status] ?? [];

    if (allowed.length === 0) {
      Swal.fire({
        title: 'Nem módosítható',
        html: `Ez a bérlés <b>${STATUS_LABELS[rental.status] ?? rental.status}</b> státuszban van,<br>
               további módosítás nem lehetséges.`,
        icon: 'info',
        confirmButtonColor: '#c9a84c'
      });
      return;
    }

    const optionsHtml = allowed
      .map(s => `<option value="${s}">${STATUS_LABELS[s] ?? s}</option>`)
      .join('');

    Swal.fire({
      title: 'Bérlés szerkesztése',
      html: `
        <p style="color:#aaa;font-size:0.82rem;margin:0 0 0.4rem;"><b>${rental.customerName}</b> — ${rental.Car?.brand ?? ''} ${rental.Car?.model ?? ''}</p>
        <p style="color:#aaa;font-size:0.78rem;margin:0 0 1rem;">
          Jelenlegi státusz: <b style="color:#1a1a1a;">${STATUS_LABELS[rental.status] ?? rental.status}</b>
        </p>
        <label style="font-size:0.8rem;color:#555;display:block;text-align:left;margin-bottom:0.3rem;">Új státusz</label>
        <select id="swal-status" class="swal2-input" style="margin-top:0;">${optionsHtml}</select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Mentés',
      cancelButtonText: 'Mégse',
      confirmButtonColor: '#c9a84c',
      cancelButtonColor: '#aaa',
      focusConfirm: false,
      preConfirm: () => (document.getElementById('swal-status') as HTMLSelectElement).value
    }).then(result => {
      if (result.isConfirmed) {
        this.rentalService.updateRentalStatus(rental.id, result.value).subscribe({
          next: () => {
            Swal.fire('Mentve!', `Státusz módosítva: <b>${STATUS_LABELS[result.value] ?? result.value}</b>`, 'success');
            this.loadRentals();
          },
          error: (err) => {
            const msg = err?.error?.message ?? 'Ismeretlen hiba.';
            Swal.fire('Hiba', msg, 'error');
          }
        });
      }
    });
  }

  // ─── Törlés ───────────────────────────────────────────────────────────────

  deleteRental(id: number): void {
    Swal.fire({
      title: 'Biztosan törlöd?',
      text: 'A bérlés adatai véglegesen elvesznek!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e05a5a',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Igen, törlöm!',
      cancelButtonText: 'Mégse'
    }).then(result => {
      if (result.isConfirmed) {
        this.rentalService.deleteRental(id).subscribe({
          next: () => {
            this.loadRentals();
            Swal.fire('Törölve!', 'A bérlés sikeresen eltávolítva.', 'success');
          },
          error: () => Swal.fire('Hiba', 'A törlés sikertelen.', 'error')
        });
      }
    });
  }
}