import React, { useContext } from 'react'
import configs from './configs'

// @ts-ignore
import ReactDOM from 'react-dom'
import { AuthContext, AuthProvider, TAuthConfig, IAuthContext } from 'react-oauth2-code-pkce'

const authConfig: TAuthConfig = configs

function LoginInfo(): JSX.Element {
  const { tokenData, token, login, logOut, idToken, idTokenData, error }: IAuthContext = useContext(AuthContext)

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
                        {/* <button onClick={()=>refreshAccessToken()}>Refresh token</button> */}
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
      <h1>Demo using the 'react-oauth2-code-pkce' package</h1>
      <p>
        Github:{' '}
        <a href="https://github.com/soofstad/react-oauth2-pkce">https://github.com/soofstad/react-oauth2-pkce</a>
      </p>
      <p>
        NPM:{' '}
        <a href="https://www.npmjs.com/package/react-oauth2-code-pkce">
          https://www.npmjs.com/package/react-oauth2-code-pkce
        </a>
      </p>
    </div>
    <AuthProvider authConfig={authConfig}>
      {/* @ts-ignore*/}
      <LoginInfo />
    </AuthProvider>
  </div>,
  document.getElementById('root')
)
