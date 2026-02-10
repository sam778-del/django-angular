import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, typeEventArgs, ReadyArgs } from 'keycloak-angular';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { TokenValidationResponse, User } from './models/user.model';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly api = inject(ApiService);
    private readonly router = inject(Router);
    private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
    private readonly storage = inject(StorageService);
    private readonly keycloak = inject(Keycloak);

    private readonly _user = signal<User | null>(null);
    private readonly _authenticated = signal(false);
    private backendValidated = false;

    readonly user = computed(() => this._user());
    readonly authenticated = computed(() => this._authenticated());
    readonly roles = computed(() => this._user()?.roles || []);

    constructor() {
        this.initializeFromStorage();
        this.setupKeycloakListener();
    }

    private initializeFromStorage(): void {
        const storedUser = this.storage.getUser();
        if (storedUser) {
            this._user.set(storedUser);
            this._authenticated.set(true);
            this.backendValidated = true;
        }
    }

    private setupKeycloakListener(): void {
        effect(() => {
            const event = this.keycloakSignal();

            if (event.type === KeycloakEventType.Ready) {
                const isAuth = typeEventArgs<ReadyArgs>(event.args);
                if (isAuth && !this.backendValidated) {
                    this.validateWithBackend();
                }
            }

            if (event.type === KeycloakEventType.AuthSuccess) {
                if (!this.backendValidated) {
                    this.validateWithBackend();
                }
            }

            if (event.type === KeycloakEventType.AuthLogout) {
                this.logout();
            }
        });
    }

    private async validateWithBackend(): Promise<void> {
        const token = this.keycloak?.token;
        if (!token) return;

        try {
            const response = await lastValueFrom(
                this.api.post<TokenValidationResponse>('/auth/validate-token/', { token })
            );

            if (response.valid && response.user) {
                const user: User = {
                    ...response.user,
                    token: response.token || token,
                    expires_at: response.expires_at || 0,
                    issued_at: response.issued_at || 0,
                    roles: response.roles || []
                };

                this._user.set(user);
                this._authenticated.set(true);
                this.storage.setUser(user);
                this.backendValidated = true;
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Backend validation failed:', error);
            this.logout();
        }
    }

    hasRole(role: string): boolean {
        return this.roles().includes(role);
    }

    hasAnyRole(roles: string[]): boolean {
        return roles.some(role => this.hasRole(role));
    }

    hasAllRoles(roles: string[]): boolean {
        return roles.every(role => this.hasRole(role));
    }

    isAdmin(): boolean {
        return this._user()?.is_admin || false;
    }

    isStaff(): boolean {
        return this._user()?.is_staff || false;
    }

    getToken(): string | undefined {
        return this._user()?.token;
    }

    login(redirectUri?: string): void {
        this.keycloak?.login({
            redirectUri: redirectUri || window.location.origin + '/dashboard'
        });
    }

    logout(redirectUri?: string): void {
        this._user.set(null);
        this._authenticated.set(false);
        this.storage.clearUser();
        this.backendValidated = false;

        this.keycloak?.logout({
            redirectUri: redirectUri || window.location.origin + '/login'
        });
    }

    async ensureAuthenticated(): Promise<boolean> {
        if (this._authenticated() && this.backendValidated) {
            return true;
        }

        if (!this.keycloak?.token) {
            return false;
        }

        if (!this.backendValidated) {
            await this.validateWithBackend();
        }

        return this._authenticated();
    }
}