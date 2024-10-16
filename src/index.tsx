import React, { useContext, useEffect, useState } from 'react';

// @ts-ignore
import ReactDOM from 'react-dom'

import {TAuthConfig , IAuthContext, AuthProvider, AuthContext} from './react-oauth2-pkce-wego'

const configs = {
  clientId: 'cbffa0a18fd0fdac2c7362f913a9c0b518a9f753e0f6c9f3086012d941e44b37',
  authorizationEndpoint: 'https://auth.wegostaging.com/user-auth/v2/users/oauth/authorize',
  logoutEndpoint: 'https://auth.wegostaging.com/user-auth/v2/users/logout',
  tokenEndpoint: 'https://srv.wegostaging.com/user-auth/v2/users/oauth/token',
  redirectUri: 'https://moneebarifwego.github.io/testing',
  extraAuthParameters: {
    "locale": "en",
    "site_code": "SA",
    "additional_attributes": "eyJhdXRoX3Ntc19lbmFibGVkIjoiMSJ9",
  },
  // extraLogoutParameters: {
  //   "post_logout_redirect_path": "/testing"
  // },
  // authorizationEndpoint: 'https://auth.wegostaging.com/users/oauth/authorize',
  // logoutEndpoint: 'https://auth.wegostaging.com/users/logout',
  // tokenEndpoint: 'https://auth.wegostaging.com/users/oauth/token',
  // redirectUri: 'https://moneebarifwego.github.io/testing',
  scope: 'users',
  // Example to redirect back to original path after login has completed
  //preLogin: () => localStorage.setItem('preLoginPath', window.location.pathname),
  //postLogin: () => window.location.replace(localStorage.getItem('preLoginPath') || ''),
  decodeToken: true,
  autoLogin: false,
  onRefreshTokenExpire: (event: { login: () => any }) => window.confirm('Session expired. Refresh page to continue using the site?') && event.login(),
}

const authConfig: TAuthConfig = configs

function LoginInfo(): JSX.Element {
  const { tokenData, token, logIn, logOut, idToken, idTokenData, error, refreshToken, refreshAccessToken }: IAuthContext = useContext(AuthContext)
  const [loading, setLoading] = useState<boolean>(false);

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('re-authenticate') === 'true') {
      logIn();
    }
  }, [logIn]);

  // Run this when the component mounts to populate input with query param value
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const val = urlParams.get('val');
    if (val) {
      setInputValue(val);
    }
  }, []);

  console.log(token);
  if (error) {
    return (
      <>
        <div style={{ color: 'red' }}>An error occurred during authentication: {error}</div>
        <button onClick={() => logOut()}>Logout</button>
      </>
    )
  }

  return (
    <>
      {token ? (
        <>
          <div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter additional parameter"
            />
          </div>
          <br/>
          <button onClick={()=>refreshAccessToken&&refreshAccessToken()}>Refresh Access token</button>
          <div>
            <h4>Refresh Token (JWT)</h4>
            <pre
              style={{
                width: '400px',
                margin: '10px',
                padding: '5px',
                border: 'black 2px solid',
                wordBreak: 'break-all',
                whiteSpace: 'break-spaces',
              }}
            >
              {refreshToken}
            </pre>
          </div>

          <div>
            <h4>Access Token (JWT)</h4>
            <pre
              style={{
                width: '400px',
                margin: '10px',
                padding: '5px',
                border: 'black 2px solid',
                wordBreak: 'break-all',
                whiteSpace: 'break-spaces',
              }}
            >
              {token}
            </pre>
          </div>

          <div>
            <h4>ID Token (JWT)</h4>
            <pre
                style={{
                  width: '400px',
                  margin: '10px',
                  padding: '5px',
                  border: 'black 2px solid',
                  wordBreak: 'break-all',
                  whiteSpace: 'break-spaces',
                }}
            >
              {idToken}
            </pre>
          </div>

          <div>
            <h4>Login Information from Access Token (Base64 decoded JWT)</h4>
            <pre
              style={{
                width: '400px',
                margin: '10px',
                padding: '5px',
                border: 'black 2px solid',
                wordBreak: 'break-all',
                whiteSpace: 'break-spaces',
              }}
            >
              {JSON.stringify(tokenData, null, 2)}
            </pre>
          </div>

          <div>
            <h4>Login Information from ID Token (Base64 decoded JWT)</h4>
            <pre
                style={{
                  width: '400px',
                  margin: '10px',
                  padding: '5px',
                  border: 'black 2px solid',
                  wordBreak: 'break-all',
                  whiteSpace: 'break-spaces',
                }}
            >
              {JSON.stringify(idTokenData, null, 2)}
            </pre>
          </div>

          <button onClick={() => logOut(undefined, undefined, {redirect_path: `?val=${inputValue}`})}>Logout</button>
        </>
      ) : (
        <>
          <div>You are not logged in.</div>
          <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter additional parameter"
          />

          <br/>
          <button onClick={() => logIn(undefined, {redirect_path: `?val=${inputValue}`}, 'popup')}>Login Popup</button>
          <br/>
          <button onClick={() => logIn(undefined, {redirect_path: `?val=${inputValue}`}, 'redirect')}>Login Redirect</button>
        </>
      )}
    </>
  )
}

ReactDOM.render(
  <div>
    <div>
      <h1>Wego Authentication Demo App</h1>
    </div>
    <AuthProvider authConfig={authConfig}>
      {/* @ts-ignore*/}
      <LoginInfo />
    </AuthProvider>
  </div>,
  document.getElementById('root')
)
