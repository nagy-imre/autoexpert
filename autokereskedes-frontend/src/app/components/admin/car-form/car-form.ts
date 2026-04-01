import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CarService } from '../../../services/car';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-car-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './car-form.html',
  styleUrl: './car-form.scss'
})
export class CarForm implements OnInit {
  carForm: FormGroup;
  currentUser: any;
  isEditMode = false;
  carId: number | null = null;
  loading = false;
  pageTitle = 'Új autó felvitele';
  backendUrl = 'http://localhost:5000'; // Háttérrendszer URL-je

  // Képfeltöltéshez
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  existingImages: any[] = []; 

  // Lenyíló menük opciói
  fuelTypes = ['Benzin', 'Dízel', 'Hibrid (Benzin)', 'Hibrid (Dízel)', 'Elektromos', 'LPG'];
  transmissions = ['Manuális', 'Automata', 'Fokozatmentes (CVT)'];
  bodyTypes = ['Sedan', 'Kombi', 'Hatchback (Ferdehátú)', 'SUV', 'Crossover', 'Egyterű (MPV)', 'Kupé', 'Cabrio', 'Pickup'];
  driveTypes = ['Elsőkerék (FWD)', 'Hátsókerék (RWD)', 'Összkerék (AWD/4WD)'];
  
  conditions = [
    { value: 'new', label: 'Új' },
    { value: 'excellent', label: 'Újszerű' },
    { value: 'normal', label: 'Normál' },
    { value: 'damaged', label: 'Sérült / Hibás' }
  ];

  serviceBooks = [
    { value: 'full_dealer', label: 'Végig márkaKarbantartás alatt' },
    { value: 'partial', label: 'Részlegesen vezetett' },
    { value: 'none', label: 'Nincs' }
  ];

  purposes = [
    { value: 'sale', label: 'Eladó' },
    { value: 'rent', label: 'Bérelhető' }
  ];

  statuses = [
    { value: 'AVAILABLE', label: 'Elérhető' },
    { value: 'IN_SERVICE', label: 'Karbantartás alatt' },
    { value: 'SOLD', label: 'Eladva' },
    { value: 'RESERVED', label: 'Lefoglalva' },
    { value: 'RENTED', label: 'Kiadva' }
  ];

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // <-- Felelős a képernyő azonnali frissítéséért
  ) {
    this.carForm = this.fb.group({
      vin: [''],
      licensePlate: ['', Validators.required],
      internalId: [''],
      motExpiry: [''],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(2030)]],
      mileage: [0, [Validators.required, Validators.min(0)]],
      bodyType: [''],
      fuelType: [''],
      transmission: [''],
      driveType: [''],
      engineCapacity: [''],
      horsepower: [''],
      color: [''],
      doors: [''],
      seats: [''],
      condition: ['normal'],
      serviceBook: ['none'],
      isCrashed: [false],
      previousOwners: [1],
      purpose: ['sale', Validators.required],
      status: ['AVAILABLE'],
      purchasePrice: [''],
      salePrice: [''],
      vatReclaimable: [false],
      rentPricePerDay: [''],
      deposit: [''],
      dailyKmLimit: [300],
      extraKmFee: [50],
      description: [''],
      features: [''] 
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.carId = Number(id);
      this.pageTitle = 'Autó szerkesztése';
      this.loadCar();
    }
  }

  loadCar(): void {
    this.carService.getCarById(this.carId!).subscribe({
      next: (car) => {
        this.existingImages = car.images || [];
        this.carForm.patchValue({
          vin: car.vin,
          licensePlate: car.licensePlate,
          internalId: car.internalId,
          motExpiry: car.motExpiry,
          brand: car.brand,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          bodyType: car.bodyType,
          fuelType: car.fuelType,
          transmission: car.transmission,
          driveType: car.driveType,
          engineCapacity: car.engineCapacity,
          horsepower: car.horsepower,
          color: car.color,
          doors: car.doors,
          seats: car.seats,
          condition: car.condition || 'normal',
          serviceBook: car.serviceBook || 'none',
          isCrashed: car.isCrashed,
          previousOwners: car.previousOwners,
          purpose: car.purpose,
          status: car.status || 'AVAILABLE',
          purchasePrice: car.purchasePrice,
          salePrice: car.salePrice,
          vatReclaimable: car.vatReclaimable,
          rentPricePerDay: car.rentPricePerDay,
          deposit: car.deposit,
          dailyKmLimit: car.dailyKmLimit || 300,
          extraKmFee: car.extraKmFee || 50,
          description: car.description,
          features: car.features ? car.features.join(', ') : ''
        });
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Hiba!', text: 'Az autó adatai nem tölthetők be.' });
        this.router.navigate(['/admin/cars']);
      }
    });
  }

  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }

  logout(): void {
    this.authService.logout();
  }

  // --- KÉPKIVÁLASZTÁS ÉS ELŐNÉZET ---
  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.cdr.detectChanges();
  }

  // --- MEGLÉVŐ KÉP TÖRLÉSE AZ ADATBÁZISBÓL ---
  async deleteExistingImage(imageId: number, index: number): Promise<void> {
    const result = await Swal.fire({
      title: 'Biztosan törlöd?',
      text: "A kép véglegesen törlésre kerül az autótól!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e05a5a',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Igen, törlöm!',
      cancelButtonText: 'Mégsem'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${this.backendUrl}/api/cars/${this.carId}/images/${imageId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (response.ok) {
          this.existingImages.splice(index, 1);
          this.cdr.detectChanges(); 
          Swal.fire({ icon: 'success', title: 'Törölve!', text: 'A kép sikeresen eltávolítva.', timer: 1500, showConfirmButton: false });
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Hiba a törlésnél');
        }
      } catch (error) {
        console.error('Kép törlési hiba:', error);
        Swal.fire({ icon: 'error', title: 'Hiba!', text: 'Nem sikerült törölni a képet a szerverről. (Nézd meg a konzolt)' });
      }
    }
  }

  // --- KÉPEK FIZIKAI FELTÖLTÉSE A BACKENDRE ---
  async uploadImages(): Promise<any[]> {
    const uploadedImages = [];
    const token = localStorage.getItem('token'); 

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const formData = new FormData();
      formData.append('image', this.selectedFiles[i]); 

      try {
        const response = await fetch(`${this.backendUrl}/api/upload`, {
          method: 'POST',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.fileName) {
          uploadedImages.push({
            imageUrl: data.fileName,
            isMain: (i === 0 && !this.isEditMode) 
          });
        } else {
          console.error('Backend hiba a képfeltöltésnél:', data);
          Swal.fire({ icon: 'error', title: 'Képfeltöltési hiba!', text: data.message || 'A szerver elutasította a képet.' });
          throw new Error('Képfeltöltés elutasítva');
        }
      } catch (error) {
        console.error('Hálózati/Feltöltési hiba:', error);
        Swal.fire({ icon: 'error', title: 'Hálózati hiba!', text: 'Nem sikerült feltölteni a képeket.' });
        throw error; 
      }
    }
    return uploadedImages;
  }

  // --- MENTÉS FOLYAMAT ---
  async submit(): Promise<void> {
    if (this.carForm.invalid) return;
    this.loading = true;

    // 1. Új képek feltöltése a szerverre
    let newImages: any[] = [];
    if (this.selectedFiles.length > 0) {
      try {
        newImages = await this.uploadImages();
      } catch (err) {
        this.loading = false;
        return; 
      }
    }

    // 2. Form adatok előkészítése
    const rawData = this.carForm.value;
    const featuresArray = rawData.features 
      ? rawData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f !== '') 
      : [];

    const carData = {
      ...rawData,
      features: featuresArray,
      images: newImages 
    };

    // 3. Adatok küldése az API-nak
    if (this.isEditMode) {
      
      this.carService.updateCar(this.carId!, carData).subscribe({
        next: async () => {
          // Képek egyenkénti csatolása a meglévő autóhoz
          if (newImages.length > 0) {
            const token = localStorage.getItem('token');
            for (let i = 0; i < newImages.length; i++) {
              try {
                await fetch(`${this.backendUrl}/api/cars/${this.carId}/images`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({
                    imageUrl: newImages[i].imageUrl,
                    isMain: (this.existingImages.length === 0 && i === 0) 
                  })
                });
              } catch (imgError) {
                console.error('Hiba történt a kép csatolásakor:', imgError);
              }
            }
          }

          this.loading = false;
          Swal.fire({ icon: 'success', title: 'Mentve!', text: 'Az autó adatai és képei sikeresen frissítve.', confirmButtonColor: '#c9a84c' });
          this.router.navigate(['/admin/cars']);
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({ icon: 'error', title: 'Hiba!', text: err.error?.message || 'Hiba történt a mentés során.', confirmButtonColor: '#c9a84c' });
        }
      });

    } else {
      
      this.carService.createCar(carData).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({ icon: 'success', title: 'Létrehozva!', text: 'Az autó sikeresen felvitve.', confirmButtonColor: '#c9a84c' });
          this.router.navigate(['/admin/cars']);
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({ icon: 'error', title: 'Hiba!', text: err.error?.message || 'Hiba történt a mentés során.', confirmButtonColor: '#c9a84c' });
        }
      });
      
    }
  }
}