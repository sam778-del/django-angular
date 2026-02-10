import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
    field: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
    customTemplate?: (row: any) => string;
}

export interface TableAction {
    label: string;
    icon?: string;
    class?: string;
    callback: (row: any) => void;
    visible?: (row: any) => boolean;
}

export interface PaginationConfig {
    pageSize: number;
    pageSizeOptions: number[];
    showPageSize: boolean;
}

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200" *ngIf="searchable || title">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 *ngIf="title" class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          
          <div class="flex items-center gap-3">
            <div *ngIf="searchable" class="relative">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearch()"
                placeholder="Search..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button 
              *ngIf="exportable"
              (click)="onExport()"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                *ngIf="selectable"
                class="px-6 py-3 text-left"
              >
                <input
                  type="checkbox"
                  [checked]="allSelected"
                  (change)="toggleSelectAll()"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </th>
              
              <th
                *ngFor="let col of columns"
                [style.width]="col.width"
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                [class.cursor-pointer]="col.sortable"
                (click)="col.sortable ? onSort(col.field) : null"
              >
                <div class="flex items-center gap-2">
                  <span>{{ col.header }}</span>
                  <div *ngIf="col.sortable" class="flex flex-col">
                    <svg 
                      class="h-3 w-3 transition-colors"
                      [class.text-blue-600]="sortField === col.field && sortDirection === 'asc'"
                      [class.text-gray-400]="sortField !== col.field || sortDirection !== 'asc'"
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </th>
              
              <th 
                *ngIf="actions.length > 0"
                class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngIf="loading" class="h-32">
              <td [attr.colspan]="getColspan()" class="px-6 py-12 text-center">
                <div class="flex justify-center items-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>

            <tr *ngIf="!loading && paginatedData.length === 0" class="h-32">
              <td [attr.colspan]="getColspan()" class="px-6 py-12 text-center text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="mt-2">{{ emptyMessage }}</p>
              </td>
            </tr>

            <tr 
              *ngFor="let row of paginatedData; let i = index"
              class="hover:bg-gray-50 transition-colors"
              [class.bg-blue-50]="selectedRows.has(row)"
            >
              <td *ngIf="selectable" class="px-6 py-4">
                <input
                  type="checkbox"
                  [checked]="selectedRows.has(row)"
                  (change)="toggleRowSelection(row)"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </td>

              <td 
                *ngFor="let col of columns"
                class="px-6 py-4 text-sm text-gray-900"
              >
                <ng-container [ngSwitch]="col.type || 'text'">
                  <span *ngSwitchCase="'boolean'">
                    <span 
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      [class.bg-green-100]="row[col.field]"
                      [class.text-green-800]="row[col.field]"
                      [class.bg-red-100]="!row[col.field]"
                      [class.text-red-800]="!row[col.field]"
                    >
                      {{ row[col.field] ? 'Yes' : 'No' }}
                    </span>
                  </span>
                  
                  <span *ngSwitchCase="'date'">
                    {{ row[col.field] | date:'MMM d, y' }}
                  </span>
                  
                  <span *ngSwitchCase="'custom'" [innerHTML]="col.customTemplate ? col.customTemplate(row) : row[col.field]"></span>
                  
                  <span *ngSwitchDefault>{{ row[col.field] }}</span>
                </ng-container>
              </td>

              <td 
                *ngIf="actions.length > 0"
                class="px-6 py-4 text-right text-sm font-medium"
              >
                <div class="flex justify-end gap-2">
                  <button
                    *ngFor="let action of actions"
                    [hidden]="action.visible && !action.visible(row)"
                    (click)="action.callback(row)"
                    [class]="action.class || 'px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors'"
                    type="button"
                  >
                    <span *ngIf="action.icon" [innerHTML]="action.icon"></span>
                    <span *ngIf="!action.icon">{{ action.label }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div 
        *ngIf="pagination && filteredData.length > 0"
        class="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div *ngIf="paginationConfig.showPageSize" class="flex items-center gap-2">
            <label class="text-sm text-gray-700">Show</label>
            <select
              [(ngModel)]="pageSize"
              (ngModelChange)="onPageSizeChange()"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option *ngFor="let size of paginationConfig.pageSizeOptions" [value]="size">
                {{ size }}
              </option>
            </select>
          </div>

          <p class="text-sm text-gray-700">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} results
          </p>
        </div>

        <nav class="flex items-center gap-2">
          <button
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div class="flex gap-1">
            <button
              *ngFor="let page of getVisiblePages()"
              (click)="page !== '...' ? goToPage(page) : null"
              [class.bg-blue-600]="page === currentPage"
              [class.text-white]="page === currentPage"
              [class.text-gray-700]="page !== currentPage"
              [class.bg-white]="page !== currentPage"
              [class.cursor-default]="page === '...'"
              class="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              [class.hover:bg-blue-600]="page === currentPage"
            >
              {{ page }}
            </button>
          </div>

          <button
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </nav>
      </div>

      <div 
        *ngIf="selectable && selectedRows.size > 0"
        class="px-6 py-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between"
      >
        <p class="text-sm text-blue-800">
          {{ selectedRows.size }} row(s) selected
        </p>
        <button
          (click)="clearSelection()"
          class="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Clear selection
        </button>
      </div>
    </div>
  `,
    styles: []
})
export class DataTableComponent implements OnInit, OnChanges {
    @Input() data: any[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() actions: TableAction[] = [];
    @Input() title: string = '';
    @Input() emptyMessage: string = 'No data available';
    @Input() loading: boolean = false;
    @Input() pagination: boolean = true;
    @Input() searchable: boolean = true;
    @Input() selectable: boolean = false;
    @Input() exportable: boolean = false;
    @Input() paginationConfig: PaginationConfig = {
        pageSize: 10,
        pageSizeOptions: [5, 10, 25, 50, 100],
        showPageSize: true
    };

    @Output() rowClick = new EventEmitter<any>();
    @Output() selectionChange = new EventEmitter<any[]>();
    @Output() export = new EventEmitter<void>();

    searchTerm: string = '';
    sortField: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    currentPage: number = 1;
    pageSize: number = 10;
    selectedRows: Set<any> = new Set();
    filteredData: any[] = [];
    paginatedData: any[] = [];

    ngOnInit() {
        this.pageSize = this.paginationConfig.pageSize;
        this.updateData();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            this.updateData();
        }
    }

    updateData() {
        this.filteredData = this.filterData([...this.data]);
        this.filteredData = this.sortData(this.filteredData);
        this.updatePagination();
    }

    filterData(data: any[]): any[] {
        if (!this.searchTerm) return data;

        return data.filter(row => {
            return this.columns.some(col => {
                const value = row[col.field];
                if (value === null || value === undefined) return false;
                return value.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
            });
        });
    }

    sortData(data: any[]): any[] {
        if (!this.sortField) return data;

        return data.sort((a, b) => {
            const aValue = a[this.sortField];
            const bValue = b[this.sortField];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            let comparison = 0;
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;

            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    updatePagination() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedData = this.filteredData.slice(start, end);
    }

    onSearch() {
        this.currentPage = 1;
        this.updateData();
    }

    onSort(field: string) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.updateData();
    }

    onPageSizeChange() {
        this.currentPage = 1;
        this.updatePagination();
    }

    goToPage(page: number | string) {
        if (typeof page === 'string') return;
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.updatePagination();
    }

    getVisiblePages(): (number | string)[] {
        const total = this.totalPages;
        const current = this.currentPage;
        const delta = 2;
        const range: (number | string)[] = [];
        const rangeWithDots: (number | string)[] = [];

        for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
            range.push(i);
        }

        if (current - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (current + delta < total - 1) {
            rangeWithDots.push('...', total);
        } else if (total > 1) {
            rangeWithDots.push(total);
        }

        return rangeWithDots;
    }

    toggleRowSelection(row: any) {
        if (this.selectedRows.has(row)) {
            this.selectedRows.delete(row);
        } else {
            this.selectedRows.add(row);
        }
        this.selectionChange.emit(Array.from(this.selectedRows));
    }

    toggleSelectAll() {
        if (this.allSelected) {
            this.selectedRows.clear();
        } else {
            this.paginatedData.forEach(row => this.selectedRows.add(row));
        }
        this.selectionChange.emit(Array.from(this.selectedRows));
    }

    clearSelection() {
        this.selectedRows.clear();
        this.selectionChange.emit([]);
    }

    onExport() {
        this.export.emit();
    }

    get allSelected(): boolean {
        return this.paginatedData.length > 0 &&
            this.paginatedData.every(row => this.selectedRows.has(row));
    }

    get totalPages(): number {
        return Math.ceil(this.filteredData.length / this.pageSize);
    }

    get startIndex(): number {
        return (this.currentPage - 1) * this.pageSize;
    }

    get endIndex(): number {
        return Math.min(this.startIndex + this.pageSize, this.filteredData.length);
    }

    getColspan(): number {
        let count = this.columns.length;
        if (this.selectable) count++;
        if (this.actions.length > 0) count++;
        return count;
    }
}