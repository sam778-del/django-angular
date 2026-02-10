import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const storage = inject(StorageService);
    const user = storage.getUser();

    if (user?.token) {
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${user.token}`
            }
        });
        return next(clonedRequest);
    }

    return next(req);
};