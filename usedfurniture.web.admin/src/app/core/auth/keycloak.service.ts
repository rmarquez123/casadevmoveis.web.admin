import Keycloak, { KeycloakInstance, KeycloakInitOptions } from 'keycloak-js';
import { environment } from '../../../environments/environment';

export class KeycloakService {
    private keycloak: KeycloakInstance | null = null;

    async init(): Promise<boolean> {
        if (!environment.enableAuth) {
            console.warn('[Auth] Disabled (enableAuth=false)');
            return true;
        }

        this.keycloak = new Keycloak({
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId,
        });

        const initOptions: KeycloakInitOptions = {
            onLoad: 'login-required',
            pkceMethod: 'S256',
            checkLoginIframe: false,
        };

        return await this.keycloak.init(initOptions);
    }

    async logout(): Promise<void> {
        if (!environment.enableAuth) {
            console.warn('[Auth] Logout ignored (auth disabled)');
            return;
        }
        await this.keycloak!.logout({ redirectUri: window.location.origin });
    }

    getToken(): string | null {
        if (!environment.enableAuth) return null;
        return this.keycloak?.token ?? null;
    }

    async updateToken(minValiditySeconds = 30): Promise<boolean> {
        if (!environment.enableAuth) return true;
        return await this.keycloak!.updateToken(minValiditySeconds);
    }

    isEnabled(): boolean {
        return environment.enableAuth;
    }

    isAuthenticated(): boolean {
        return !environment.enableAuth || !!this.keycloak?.token;
    }
}

export const keycloakService = new KeycloakService();
