// src/app/core/http/auth-token.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { keycloakService } from '../auth/keycloak.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
    // Only attach to API calls
    const apiPrefix = environment.apiUrl;

    const isApiCall =
        req.url.startsWith(apiPrefix) ||
        (apiPrefix.startsWith('http') && req.url.startsWith(apiPrefix));

    if (!isApiCall || !keycloakService.isEnabled()) {
        return next(req);
    }

    // Best effort token refresh before attaching
    return (async () => {
        await keycloakService.updateToken(30);
        const token = keycloakService.getToken();
        if (!token) return next(req);

        return next(
            req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
            })
        );
    })() as any;
};
