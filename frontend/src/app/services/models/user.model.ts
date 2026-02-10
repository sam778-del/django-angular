export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_admin: boolean;
    is_staff: boolean;
    keycloak_id: string;
    roles: string[];
    token: string;
    expires_at: number;
    issued_at: number;
}

export interface TokenValidationResponse {
    valid: boolean;
    user?: User;
    token?: string;
    expires_at?: number;
    issued_at?: number;
    roles?: string[];
    error?: string;
}

export interface CreateUserDto {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    roles?: string[];
}

export interface UpdateUserDto {
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}

export interface AssignRoleDto {
    role: string;
}