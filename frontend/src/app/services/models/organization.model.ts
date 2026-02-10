export interface Organization {
    id: string;
    name: string;
    industry: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active: boolean;
    datetime_created: string;
    datetime_updated: string;
}

export interface CreateOrganizationDto {
    name: string;
    industry: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface UpdateOrganizationDto {
    name?: string;
    industry?: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
}