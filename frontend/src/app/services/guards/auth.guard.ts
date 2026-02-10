import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { AuthService } from '../auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const storage = inject(StorageService);

    if (storage.hasValidSession()) {
        return true;
    }

    const isAuthenticated = await authService.ensureAuthenticated();

    if (!isAuthenticated) {
        authService.login(window.location.origin + state.url);
        return false;
    }

    return true;
};