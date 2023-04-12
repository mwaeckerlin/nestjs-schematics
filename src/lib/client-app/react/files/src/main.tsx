import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {
  Error as ErrorComponent,
  register,
  reportWebVitals,
  i18n,
} from '@pacta/components'
import { Provider } from 'react-redux'
import { store } from './store'
import { I18nextProvider } from 'react-i18next'
import { OpenAPIProvider } from 'react-openapi-client'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
try {
  root.render(
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <OpenAPIProvider
          definition={
            window.location.origin.replace(/:4200.*/, ':4000') + '/api-json'
          }
        >
          <React.StrictMode>
            <React.Suspense fallback={<p>Loading…</p>}>
              <App />
            </React.Suspense>
          </React.StrictMode>
        </OpenAPIProvider>
      </Provider>
    </I18nextProvider>
  )
} catch (error) {
  console.error(error)
  if (error instanceof Error)
    root.render(
      <ErrorComponent
        heading="Render Error"
        message={
          <>
            <p>Uncaught Error in App Main:</p>
            <p>{error?.toString() ?? error}</p>
            <pre>{JSON.stringify(error, null, 4)}</pre>
          </>
        }
      />
    )
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
register()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.debug)
