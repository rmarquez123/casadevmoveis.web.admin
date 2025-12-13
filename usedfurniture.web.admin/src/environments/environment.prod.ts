// src/environments/environment.prod.ts
export const environment = {
  production: true,
  enableAuth: true,
  apiUrl: 'https://restapi.casademoveisusados.com',
  keycloak: {
    url: 'https://auth.casademoveisusados.com',
    realm: 'casademoveis',
    clientId: 'web-admin',
  },
};
