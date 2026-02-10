import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from './models/organization.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {
    private readonly api = inject(ApiService);
    private readonly endpoint = '/organizations';

    getAll(params?: {
        page?: number;
        page_size?: number;
        search?: string;
        ordering?: string;
    }): Observable<PaginatedResponse<Organization>> {
        return this.api.get<PaginatedResponse<Organization>>(`${this.endpoint}/`, params);
    }

    getById(id: string): Observable<Organization> {
        return this.api.get<Organization>(`${this.endpoint}/${id}/`);
    }

    create(data: CreateOrganizationDto): Observable<Organization> {
        return this.api.post<Organization>(`${this.endpoint}/`, data);
    }

    update(id: string, data: UpdateOrganizationDto): Observable<Organization> {
        return this.api.patch<Organization>(`${this.endpoint}/${id}/`, data);
    }

    delete(id: string): Observable<void> {
        return this.api.delete<void>(`${this.endpoint}/${id}/`);
    }
}