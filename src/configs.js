const configs = {
  clientId: 'demo-app',
  authorizationEndpoint: 'https://srv.wegostaging.com/user-auth/v2/users/oauth/authorize',
  logoutEndpoint: 'https://srv.wegostaging.com/user-auth/v2/users/logout',
  tokenEndpoint: 'https://srv.wegostaging.com/user-auth/v2/users/oauth/token',
  redirectUri: 'https://moneebarifwego.github.io/testing',
  scope: 'openid',
  // Example to redirect back to original path after login has completed
  preLogin: () => localStorage.setItem('preLoginPath', window.location.pathname),
  postLogin: () => window.location.replace(localStorage.getItem('preLoginPath') || ''),
  decodeToken: true,
  autoLogin: false,
  onRefreshTokenExpire: (event) => window.confirm('Session expired. Refresh page to continue using the site?') && event.login(),
}

export default configs;