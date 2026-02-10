import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../shared/components/dynamic-table/dynamic-table.component';
import { RecordService } from '../services/record.service';
import { DocumentService } from '../services/document.service';
import { Record, CreateRecordDto, UpdateRecordDto } from '../services/models/record.model';
import { Document } from '../services/models/document.model';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, DataTableComponent, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <app-data-table
        [data]="records()"
        [columns]="columns"
        [actions]="actions"
        [title]="'Records Management'"
        [loading]="loading()"
        [pagination]="true"
        [searchable]="true"
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
              {{ isEditMode() ? 'Edit Record' : 'Create Record' }}
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  formControlName="title"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  [class.border-red-500]="form.get('title')?.invalid && form.get('title')?.touched"
                />
                <p *ngIf="form.get('title')?.invalid && form.get('title')?.touched" class="mt-1 text-sm text-red-600">
                  Title is required
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  formControlName="description"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  [class.border-red-500]="form.get('description')?.invalid && form.get('description')?.touched"
                ></textarea>
                <p *ngIf="form.get('description')?.invalid && form.get('description')?.touched" class="mt-1 text-sm text-red-600">
                  Description is required
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  formControlName="status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div *ngIf="!isEditMode()">
                <label class="block text-sm font-medium text-gray-700 mb-2">Attach Files</label>
                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  (click)="fileInput.click()"
                  (dragover)="onDragOver($event)"
                  (drop)="onDrop($event)"
                >
                  <input
                    #fileInput
                    type="file"
                    multiple
                    (change)="onFileSelected($event)"
                    class="hidden"
                  />
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p class="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>

                <div *ngIf="selectedFiles().length > 0" class="mt-3 space-y-2">
                  <div
                    *ngFor="let file of selectedFiles(); let i = index"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                        <p class="text-xs text-gray-500">{{ (file.size / 1024).toFixed(2) }} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      (click)="removeFile(i)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
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
              <h3 class="text-lg font-semibold text-gray-900">Delete Record</h3>
              <p class="text-sm text-gray-600">Are you sure you want to delete this record?</p>
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
export class RecordsComponent implements OnInit {
  private readonly recordService = inject(RecordService);
  private readonly documentService = inject(DocumentService);
  private readonly fb = inject(FormBuilder);

  records = signal<Record[]>([]);
  selectedFiles = signal<File[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);
  selectedRecord: Record | null = null;
  recordToDelete: Record | null = null;

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    status: ['draft']
  });

  columns: TableColumn[] = [
    { field: 'title', header: 'Title', sortable: true, width: '250px' },
    { field: 'description', header: 'Description', width: '350px' },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      width: '120px',
      type: 'custom',
      customTemplate: (row: Record) => this.getStatusBadge(row.status)
    },
    { field: 'datetime_created', header: 'Created', type: 'date', sortable: true }
  ];

  actions: TableAction[] = [
    {
      label: 'Edit',
      class: 'px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors',
      callback: (row: Record) => this.handleEdit(row)
    },
    {
      label: 'Delete',
      class: 'px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors',
      callback: (row: Record) => this.handleDelete(row)
    }
  ];

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.loading.set(true);
    this.recordService.getAll().subscribe({
      next: (response) => {
        this.records.set(response.results);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading records:', error);
        this.loading.set(false);
      }
    });
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      draft: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Draft</span>',
      pending: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>',
      approved: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>',
      rejected: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>'
    };
    return badges[status] || status;
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedRecord = null;
    this.selectedFiles.set([]);
    this.form.reset({ status: 'draft' });
    this.showModal.set(true);
  }

  handleEdit(record: Record) {
    this.isEditMode.set(true);
    this.selectedRecord = record;
    this.form.patchValue({
      title: record.title,
      description: record.description,
      status: record.status
    });
    this.showModal.set(true);
  }

  handleDelete(record: Record) {
    this.recordToDelete = record;
    this.showDeleteConfirm.set(true);
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.update(current => [...current, ...files]);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    this.selectedFiles.update(current => [...current, ...files]);
  }

  removeFile(index: number) {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  handleSubmit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formData = this.form.value;

    const operation = this.isEditMode() && this.selectedRecord
      ? this.recordService.update(this.selectedRecord.id, formData as UpdateRecordDto)
      : this.recordService.create(formData as CreateRecordDto);

    operation.subscribe({
      next: (record) => {
        if (!this.isEditMode() && this.selectedFiles().length > 0) {
          this.uploadFiles(record.id);
        } else {
          this.submitting.set(false);
          this.closeModal();
          this.loadRecords();
        }
      },
      error: (error) => {
        console.error('Error saving record:', error);
        this.submitting.set(false);
      }
    });
  }

  uploadFiles(recordId: string) {
    const files = this.selectedFiles();
    let uploadedCount = 0;

    files.forEach(file => {
      this.documentService.upload({ file, record: recordId }).subscribe({
        next: () => {
          uploadedCount++;
          if (uploadedCount === files.length) {
            this.submitting.set(false);
            this.closeModal();
            this.loadRecords();
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          uploadedCount++;
          if (uploadedCount === files.length) {
            this.submitting.set(false);
            this.closeModal();
            this.loadRecords();
          }
        }
      });
    });
  }

  confirmDelete() {
    if (!this.recordToDelete) return;

    this.submitting.set(true);
    this.recordService.delete(this.recordToDelete.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeDeleteConfirm();
        this.loadRecords();
      },
      error: (error) => {
        console.error('Error deleting record:', error);
        this.submitting.set(false);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.form.reset();
    this.selectedFiles.set([]);
    this.selectedRecord = null;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.recordToDelete = null;
  }

  handleExport() {
    console.log('Exporting records...');
  }
}