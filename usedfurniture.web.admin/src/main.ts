// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { keycloakService } from './app/core/auth/keycloak.service';

(async () => {
  await keycloakService.init();
  await bootstrapApplication(AppComponent, appConfig);
})();
