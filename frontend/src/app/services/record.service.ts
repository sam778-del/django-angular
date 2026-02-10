import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';
import { Record, CreateRecordDto, UpdateRecordDto } from './models/record.model';

@Injectable({
    providedIn: 'root'
})
export class RecordService {
    private readonly api = inject(ApiService);
    private readonly endpoint = '/records';

    getAll(params?: {
        page?: number;
        page_size?: number;
        search?: string;
        ordering?: string;
        status?: string;
        category?: string;
        assigned_to?: string;
    }): Observable<PaginatedResponse<Record>> {
        return this.api.get<PaginatedResponse<Record>>(`${this.endpoint}/`, params);
    }

    getById(id: string): Observable<Record> {
        return this.api.get<Record>(`${this.endpoint}/${id}/`);
    }

    create(data: CreateRecordDto): Observable<Record> {
        return this.api.post<Record>(`${this.endpoint}/`, data);
    }

    update(id: string, data: UpdateRecordDto): Observable<Record> {
        return this.api.patch<Record>(`${this.endpoint}/${id}/`, data);
    }

    delete(id: string): Observable<void> {
        return this.api.delete<void>(`${this.endpoint}/${id}/`);
    }
}