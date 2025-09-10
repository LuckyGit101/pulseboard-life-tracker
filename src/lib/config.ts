// API Configuration for Pulseboard Backend
export const config = {
  api: {
    baseUrl: (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8080',
  },
  auth: {
    tokenKey: 'pulseboard_token',
    refreshTokenKey: 'pulseboard_refresh_token',
    userKey: 'pulseboard_user',
  }
};
