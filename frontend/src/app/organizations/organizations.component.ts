import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../shared/components/dynamic-table/dynamic-table.component';
import { OrganizationService } from '../services/organization.service';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '../services/models/organization.model';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [CommonModule, DataTableComponent, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <app-data-table
        [data]="organizations()"
        [columns]="columns"
        [actions]="actions"
        [title]="'Organizations Management'"
        [loading]="loading()"
        [pagination]="true"
        [searchable]="true"
        [selectable]="false"
        [exportable]="true"
        (export)="handleExport()"
      ></app-data-table>

      <button
        (click)="openCreateModal()"
        class="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <div
        *ngIf="showModal()"
        class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
        (click)="closeModal()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ isEditMode() ? 'Edit Organization' : 'Create Organization' }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  [class.border-red-500]="form.get('name')?.invalid && form.get('name')?.touched"
                />
                <p *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="mt-1 text-sm text-red-600">
                  Name is required
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                <input
                  type="text"
                  formControlName="industry"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  [class.border-red-500]="form.get('industry')?.invalid && form.get('industry')?.touched"
                />
                <p *ngIf="form.get('industry')?.invalid && form.get('industry')?.touched" class="mt-1 text-sm text-red-600">
                  Industry is required
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    formControlName="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  formControlName="website"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  formControlName="address"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                ></textarea>
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
        *ngIf="showDeleteConfirm()"
        class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
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
              <h3 class="text-lg font-semibold text-gray-900">Delete Organization</h3>
              <p class="text-sm text-gray-600">Are you sure you want to delete this organization?</p>
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
export class OrganizationsComponent implements OnInit {
  private readonly organizationService = inject(OrganizationService);
  private readonly fb = inject(FormBuilder);

  organizations = signal<Organization[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);
  selectedOrganization: Organization | null = null;
  organizationToDelete: Organization | null = null;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    industry: ['', Validators.required],
    description: [''],
    email: [''],
    phone: [''],
    website: [''],
    address: ['']
  });

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, width: '200px' },
    { field: 'industry', header: 'Industry', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone', header: 'Phone' },
    { field: 'website', header: 'Website' },
    {
      field: 'is_active',
      header: 'Status',
      type: 'boolean',
      sortable: true,
      width: '100px'
    }
  ];

  actions: TableAction[] = [
    {
      label: 'Edit',
      class: 'px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors',
      callback: (row: Organization) => this.handleEdit(row)
    },
    {
      label: 'Delete',
      class: 'px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors',
      callback: (row: Organization) => this.handleDelete(row)
    }
  ];

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.loading.set(true);
    this.organizationService.getAll().subscribe({
      next: (response) => {
        this.organizations.set(response.results);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.loading.set(false);
      }
    });
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedOrganization = null;
    this.form.reset();
    this.showModal.set(true);
  }

  handleEdit(organization: Organization) {
    this.isEditMode.set(true);
    this.selectedOrganization = organization;
    this.form.patchValue({
      name: organization.name,
      industry: organization.industry,
      description: organization.description,
      email: organization.email,
      phone: organization.phone,
      website: organization.website,
      address: organization.address
    });
    this.showModal.set(true);
  }

  handleDelete(organization: Organization) {
    this.organizationToDelete = organization;
    this.showDeleteConfirm.set(true);
  }

  handleSubmit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formData = this.form.value;

    const operation = this.isEditMode() && this.selectedOrganization
      ? this.organizationService.update(this.selectedOrganization.id, formData as UpdateOrganizationDto)
      : this.organizationService.create(formData as CreateOrganizationDto);

    operation.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadOrganizations();
      },
      error: (error) => {
        console.error('Error saving organization:', error);
        this.submitting.set(false);
      }
    });
  }

  confirmDelete() {
    if (!this.organizationToDelete) return;

    this.submitting.set(true);
    this.organizationService.delete(this.organizationToDelete.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeDeleteConfirm();
        this.loadOrganizations();
      },
      error: (error) => {
        console.error('Error deleting organization:', error);
        this.submitting.set(false);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.form.reset();
    this.selectedOrganization = null;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.organizationToDelete = null;
  }

  handleExport() {
    console.log('Exporting organizations...');
  }
}