import { User } from "./user.model";

export interface TokenValidationResponse {
    valid: boolean;
    user: User;
    roles?: string[];
}