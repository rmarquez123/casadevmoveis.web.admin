import { CanActivateFn } from '@angular/router';
import { keycloakService } from './keycloak.service';

export const authGuard: CanActivateFn = async () => {
    if (!keycloakService.isEnabled()) return true;
    return keycloakService.isAuthenticated();
};
