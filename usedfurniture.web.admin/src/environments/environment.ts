// src/environments/environment.prod.ts

export const environment = {
  production: false,
  enableAuth: false, // <-- bypass Keycloak in dev
  apiUrl: 'https://restapi.casademoveisusados.com',

  keycloak: {
    url: 'https://auth.casademoveisusados.com',
    realm: 'casademoveis',
    clientId: 'web-admin',
  },
};
