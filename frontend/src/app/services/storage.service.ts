import { Injectable } from '@angular/core';
import { User } from './models/user.model';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly USER_KEY = 'auth_user';

    setUser(user: User): void {
        const expiryDate = new Date(user.expires_at * 1000);
        document.cookie = `${this.USER_KEY}=${JSON.stringify(user)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    }

    getUser(): User | null {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${this.USER_KEY}=`));

        if (!cookie) return null;

        try {
            const userData = JSON.parse(cookie.split('=')[1]);
            const now = Math.floor(Date.now() / 1000);

            if (userData.expires_at && userData.expires_at < now) {
                this.clearUser();
                return null;
            }

            return userData;
        } catch {
            return null;
        }
    }

    clearUser(): void {
        document.cookie = `${this.USER_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    hasValidSession(): boolean {
        const user = this.getUser();
        return user !== null;
    }
}