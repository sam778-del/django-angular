export interface Record {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    category?: string;
    assigned_to?: string;
    creator: string;
    tags?: string[];
    datetime_created: string;
    datetime_updated: string;
}

export interface CreateRecordDto {
    title: string;
    description: string;
    status?: 'draft' | 'pending' | 'approved' | 'rejected';
    category?: string;
    assigned_to?: string;
    tags?: string[];
}

export interface UpdateRecordDto {
    title?: string;
    description?: string;
    status?: 'draft' | 'pending' | 'approved' | 'rejected';
    category?: string;
    assigned_to?: string;
    tags?: string[];
}