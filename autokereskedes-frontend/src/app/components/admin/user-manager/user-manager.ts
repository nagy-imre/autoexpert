import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { UserService } from '../../../services/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-manager.html',
  styleUrl: './user-manager.scss'
})
export class UserManager implements OnInit {
  currentUser: any;
  users: any[] = [];
  loading = true;

  showModal = false;
  userForm: FormGroup;
  isSubmitting = false;

  roles = [
    { value: 'superadmin', label: 'Rendszergazda (Mindenhez hozzáfér)' },
    { value: 'car_manager', label: 'Autó Menedzser (Autókat kezel)' },
    { value: 'rental_manager', label: 'Bérlés Menedzser (Bérléseket kezel)' },
    { value: 'viewer', label: 'Megfigyelő (Csak olvasási jog)' }
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['viewer', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
  }

  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoleLabel(roleValue: string): string {
    const role = this.roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  }

  openModal(): void {
    this.userForm.reset({ role: 'viewer' });
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  submitUser(): void {
    if (this.userForm.invalid) return;
    this.isSubmitting = true;

    this.userService.createUser(this.userForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadUsers();
        Swal.fire({ icon: 'success', title: 'Siker!', text: 'Munkatárs sikeresen hozzáadva.', confirmButtonColor: '#c9a84c' });
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({ icon: 'error', title: 'Hiba!', text: err.error?.message || 'Nem sikerült létrehozni a fiókot.', confirmButtonColor: '#c9a84c' });
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(user: any): void {
    if (user.role === 'superadmin') {
      Swal.fire({ icon: 'error', title: 'Hiba', text: 'Rendszergazdát nem lehet törölni!' });
      return;
    }

    Swal.fire({
      title: 'Biztosan törlöd?',
      text: `${user.name} fiókja véglegesen törlődik!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e05a5a',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Igen, törlöm'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire({ icon: 'success', title: 'Törölve!', text: 'Fiók sikeresen eltávolítva.', timer: 2000, showConfirmButton: false });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Hiba', text: 'Hiba történt a törlés során.' })
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}