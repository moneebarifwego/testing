import React, { useContext } from 'react'

// @ts-ignore
import ReactDOM from 'react-dom'

import {TAuthConfig , IAuthContext, AuthProvider, AuthContext} from './react-oauth2-pkce-wego'

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
  onRefreshTokenExpire: (event: { login: () => any }) => window.confirm('Session expired. Refresh page to continue using the site?') && event.login(),
}

const authConfig: TAuthConfig = configs

function LoginInfo(): JSX.Element {
  const { tokenData, token, login, logOut, idToken, idTokenData, error, refreshToken, refreshAccessToken }: IAuthContext = useContext(AuthContext)

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
          <button onClick={()=>refreshAccessToken&&refreshAccessToken()}>Refresh Access token</button>
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


          <button onClick={() => logOut()}>Logout</button>
        </>
      ) : (
        <>
          <div>You are not logged in.</div>
          <button onClick={() => login()}>Login</button>
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
