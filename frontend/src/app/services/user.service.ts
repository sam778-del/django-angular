import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';
import { User, CreateUserDto, UpdateUserDto, AssignRoleDto } from './models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly api = inject(ApiService);
    private readonly endpoint = '/users';

    getAll(params?: {
        page?: number;
        page_size?: number;
        search?: string;
        ordering?: string;
        email?: string;
        is_staff?: boolean;
        is_admin?: boolean;
    }): Observable<PaginatedResponse<User>> {
        return this.api.get<PaginatedResponse<User>>(`${this.endpoint}/`, params);
    }

    getById(id: string): Observable<User> {
        return this.api.get<User>(`${this.endpoint}/${id}/`);
    }

    create(data: CreateUserDto): Observable<User> {
        return this.api.post<User>(`${this.endpoint}/`, data);
    }

    update(id: string, data: UpdateUserDto): Observable<User> {
        return this.api.patch<User>(`${this.endpoint}/${id}/`, data);
    }

    delete(id: string): Observable<void> {
        return this.api.delete<void>(`${this.endpoint}/${id}/`);
    }

    assignRole(id: string, data: AssignRoleDto): Observable<{ status: string }> {
        return this.api.post<{ status: string }>(`${this.endpoint}/${id}/assign-role/`, data);
    }
}