import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';
import { Project, CreateProjectDto, UpdateProjectDto } from './models/project.model';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private readonly api = inject(ApiService);
    private readonly endpoint = '/projects';

    getAll(params?: {
        page?: number;
        page_size?: number;
        search?: string;
        ordering?: string;
        status?: string;
        organization?: string;
    }): Observable<PaginatedResponse<Project>> {
        return this.api.get<PaginatedResponse<Project>>(`${this.endpoint}/`, params);
    }

    getById(id: string): Observable<Project> {
        return this.api.get<Project>(`${this.endpoint}/${id}/`);
    }

    create(data: CreateProjectDto): Observable<Project> {
        return this.api.post<Project>(`${this.endpoint}/`, data);
    }

    update(id: string, data: UpdateProjectDto): Observable<Project> {
        return this.api.patch<Project>(`${this.endpoint}/${id}/`, data);
    }

    delete(id: string): Observable<void> {
        return this.api.delete<void>(`${this.endpoint}/${id}/`);
    }
}