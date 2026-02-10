import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';
import { Document, CreateDocumentDto } from './models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private readonly api = inject(ApiService);
    private readonly endpoint = '/documents';

    getAll(params?: {
        page?: number;
        page_size?: number;
        record?: string;
        ordering?: string;
    }): Observable<PaginatedResponse<Document>> {
        return this.api.get<PaginatedResponse<Document>>(`${this.endpoint}/`, params);
    }

    getById(id: string): Observable<Document> {
        return this.api.get<Document>(`${this.endpoint}/${id}/`);
    }

    upload(data: CreateDocumentDto): Observable<Document> {
        return this.api.upload<Document>(`${this.endpoint}/`, data.file, { record: data.record });
    }

    delete(id: string): Observable<void> {
        return this.api.delete<void>(`${this.endpoint}/${id}/`);
    }

    download(id: string): Observable<Blob> {
        return this.api.get<Blob>(`${this.endpoint}/${id}/download/`);
    }
}