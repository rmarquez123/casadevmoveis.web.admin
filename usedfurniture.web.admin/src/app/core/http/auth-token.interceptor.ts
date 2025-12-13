// src/app/core/http/auth-token.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { keycloakService } from '../auth/keycloak.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
    // If auth disabled, passthrough
    if (!keycloakService.isEnabled()) {
        return next(req);
    }

    // Attach only to API calls (adjust if you use /api proxy)
    const apiPrefix = environment.apiUrl; // or environment.apiBaseUrl if you renamed it
    const isApiCall = req.url.startsWith(apiPrefix) || req.url.startsWith('/api/');

    if (!isApiCall) {
        return next(req);
    }

    // Refresh token (Promise) -> Observable, then attach token
    return from(keycloakService.updateToken(30)).pipe(
        switchMap(() => {
            const token = keycloakService.getToken();
            if (!token) return next(req);

            return next(
                req.clone({
                    setHeaders: { Authorization: `Bearer ${token}` },
                })
            );
        })
    );
};
