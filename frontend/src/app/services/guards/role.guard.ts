import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { StorageService } from '../storage.service';

export const roleGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const storage = inject(StorageService);
    const router = inject(Router);

    const requiredRoles = route.data['roles'] as string[];

    if (!storage.hasValidSession()) {
        const isAuthenticated = await authService.ensureAuthenticated();
        if (!isAuthenticated) {
            authService.login(window.location.origin + state.url);
            return false;
        }
    }

    if (requiredRoles && requiredRoles.length > 0) {
        const hasAccess = authService.hasAnyRole(requiredRoles);

        if (!hasAccess) {
            router.navigate(['/unauthorized']);
            return false;
        }
    }

    return true;
};