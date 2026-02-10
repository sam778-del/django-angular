import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../shared/components/dynamic-table/dynamic-table.component';
import { UserService } from '../services/user.service';
import { User, CreateUserDto, UpdateUserDto } from '../services/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, DataTableComponent, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <app-data-table
        [data]="users()"
        [columns]="columns"
        [actions]="actions"
        [title]="'Users Management'"
        [loading]="loading()"
        [pagination]="true"
        [searchable]="true"
        [exportable]="true"
        (export)="handleExport()"
      ></app-data-table>

      <div
        *ngIf="showModal()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="closeModal()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ isEditMode() ? 'Edit User' : 'Create User' }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="p-6">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    formControlName="first_name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    [class.border-red-500]="form.get('first_name')?.invalid && form.get('first_name')?.touched"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    formControlName="last_name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    [class.border-red-500]="form.get('last_name')?.invalid && form.get('last_name')?.touched"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  formControlName="username"
                  [disabled]="isEditMode()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  [class.border-red-500]="form.get('username')?.invalid && form.get('username')?.touched"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched"
                />
              </div>

              <div *ngIf="!isEditMode()">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  formControlName="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  [class.border-red-500]="form.get('password')?.invalid && form.get('password')?.touched"
                />
              </div>

              <div *ngIf="isEditMode()" class="space-y-3">
                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    formControlName="is_active"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label for="is_active" class="text-sm font-medium text-gray-700">Active</label>
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_staff"
                    formControlName="is_staff"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label for="is_staff" class="text-sm font-medium text-gray-700">Staff</label>
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_admin"
                    formControlName="is_admin"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label for="is_admin" class="text-sm font-medium text-gray-700">Admin</label>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="form.invalid || submitting()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ submitting() ? 'Saving...' : (isEditMode() ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        *ngIf="showRoleModal()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="closeRoleModal()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          (click)="$event.stopPropagation()"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Assign Role</h3>
          
          <div class="space-y-3">
            <label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                [(ngModel)]="selectedRole"
                value="admin"
                name="role"
                class="w-4 h-4 text-blue-600"
              />
              <span class="ml-3 text-sm font-medium text-gray-900">Admin</span>
            </label>

            <label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                [(ngModel)]="selectedRole"
                value="operator"
                name="role"
                class="w-4 h-4 text-blue-600"
              />
              <span class="ml-3 text-sm font-medium text-gray-900">Operator</span>
            </label>

            <label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                [(ngModel)]="selectedRole"
                value="viewer"
                name="role"
                class="w-4 h-4 text-blue-600"
              />
              <span class="ml-3 text-sm font-medium text-gray-900">Viewer</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="closeRoleModal()"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="confirmAssignRole()"
              [disabled]="!selectedRole || submitting()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {{ submitting() ? 'Assigning...' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>

      <div
        *ngIf="showDeleteConfirm()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="closeDeleteConfirm()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Delete User</h3>
              <p class="text-sm text-gray-600">Are you sure you want to delete this user?</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="closeDeleteConfirm()"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="confirmDelete()"
              [disabled]="submitting()"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {{ submitting() ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  users = signal<User[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showRoleModal = signal(false);
  showDeleteConfirm = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);
  selectedUser: User | null = null;
  userToDelete: User | null = null;
  userForRole: User | null = null;
  selectedRole: string = '';

  form: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    is_active: [true],
    is_staff: [false],
    is_admin: [false]
  });

  columns: TableColumn[] = [
    { field: 'username', header: 'Username', sortable: true, width: '150px' },
    { field: 'email', header: 'Email', sortable: true, width: '200px' },
    { field: 'first_name', header: 'First Name', sortable: true },
    { field: 'last_name', header: 'Last Name', sortable: true },
    {
      field: 'is_active',
      header: 'Active',
      type: 'boolean',
      sortable: true,
      width: '100px'
    },
    {
      field: 'roles',
      header: 'Roles',
      type: 'custom',
      width: '150px',
      customTemplate: (row: User) => this.getRolesBadges(row.roles || [])
    },
    { field: 'date_joined', header: 'Joined', type: 'date', sortable: true }
  ];

  actions: TableAction[] = [
    // {
    //   label: 'Assign Role',
    //   class: 'px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors',
    //   callback: (row: User) => this.openRoleModal(row)
    // },
    // {
    //   label: 'Edit',
    //   class: 'px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors',
    //   callback: (row: User) => this.handleEdit(row)
    // },
    {
      label: 'Delete',
      class: 'px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors',
      callback: (row: User) => this.handleDelete(row)
    }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (response) => {
        this.users.set(response.results);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      }
    });
  }

  getRolesBadges(roles: string[]): string {
    const roleColors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      operator: 'bg-blue-100 text-blue-800',
      viewer: 'bg-green-100 text-green-800'
    };

    return roles
      .map(role => `<span class="px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}">${role}</span>`)
      .join(' ');
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedUser = null;
    this.form.reset({ is_active: true, is_staff: false, is_admin: false });
    this.form.get('password')?.setValidators([Validators.required]);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  handleEdit(user: User) {
    this.isEditMode.set(true);
    this.selectedUser = user;
    this.form.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_admin: user.is_admin
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  handleDelete(user: User) {
    this.userToDelete = user;
    this.showDeleteConfirm.set(true);
  }

  openRoleModal(user: User) {
    this.userForRole = user;
    this.selectedRole = '';
    this.showRoleModal.set(true);
  }

  handleSubmit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formData = { ...this.form.value };

    if (this.isEditMode()) {
      delete formData.password;
      delete formData.username;
    }

    const operation = this.isEditMode() && this.selectedUser
      ? this.userService.update(this.selectedUser.id, formData as UpdateUserDto)
      : this.userService.create(formData as CreateUserDto);

    operation.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error saving user:', error);
        this.submitting.set(false);
      }
    });
  }

  confirmAssignRole() {
    if (!this.userForRole || !this.selectedRole) return;

    this.submitting.set(true);
    this.userService.assignRole(this.userForRole.id, { role: this.selectedRole as any }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeRoleModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error assigning role:', error);
        this.submitting.set(false);
      }
    });
  }

  confirmDelete() {
    if (!this.userToDelete) return;

    this.submitting.set(true);
    this.userService.delete(this.userToDelete.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeDeleteConfirm();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.submitting.set(false);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.form.reset();
    this.selectedUser = null;
  }

  closeRoleModal() {
    this.showRoleModal.set(false);
    this.userForRole = null;
    this.selectedRole = '';
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.userToDelete = null;
  }

  handleExport() {
    console.log('Exporting users...');
  }
}