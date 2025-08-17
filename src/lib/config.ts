// API Configuration for Pulseboard Backend
export const config = {
  api: {
    baseUrl: 'https://37r1mz831d.execute-api.ap-southeast-2.amazonaws.com/dev',
  },
  auth: {
    tokenKey: 'pulseboard_token',
    refreshTokenKey: 'pulseboard_refresh_token',
    userKey: 'pulseboard_user',
  }
};
