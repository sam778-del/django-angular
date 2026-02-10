export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
    start_date?: string;
    end_date?: string;
    organization?: string;
    manager?: string;
    members?: string[];
    datetime_created: string;
    datetime_updated: string;
}

export interface CreateProjectDto {
    name: string;
    description: string;
    status?: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
    start_date?: string;
    end_date?: string;
    organization?: string;
    manager?: string;
    members?: string[];
}

export interface UpdateProjectDto {
    name?: string;
    description?: string;
    status?: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
    start_date?: string;
    end_date?: string;
    organization?: string;
    manager?: string;
    members?: string[];
}