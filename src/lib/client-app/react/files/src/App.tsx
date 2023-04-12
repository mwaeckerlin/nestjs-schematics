import React, { useEffect } from 'react'
import { ErrorBoundary, Layout, setError } from '@pacta/components'
import manifest from './assets/manifest.json'
import releasenotes from './ReleaseNotes.yaml'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Router from './Router'

export default () => {
  const dispatch = useDispatch()
  useEffect(() => {
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      console.error({ msg, url, lineNo, columnNo, error })
      if (!msg.match(/metamask/i) && !msg.match(/bity/i))
        dispatch(
          setError({
            heading: msg,
            message: (
              <>
                <dl>
                  <dt>Error</dt>
                  <dd>{msg}</dd>
                  <dd>
                    <pre>{JSON.stringify(error, null, 4)}</pre>
                  </dd>
                  <dt>File:Line:Column</dt>
                  <dd>{url + ':' + lineNo + ':' + columnNo}</dd>
                </dl>
              </>
            ),
          })
        )
      return false
    }
    return () => {
      window.onerror = (msg, url, lineNo, columnNo, error) => {
        console.error({ msg, url, lineNo, columnNo, error })
        return false
      }
    }
  }, [])
  const keyPair = useSelector((s) => s.pgp.keyPair)
  const password = useSelector((s) => s.pgp.password)
  return (
    <ErrorBoundary>
      <Layout
        name={manifest?.short_name}
        slogan={manifest?.name}
        description={manifest?.description}
        version={releasenotes?.[0]?.version}
        releasenotes={releasenotes}
        manifest={manifest}
      >
        <ErrorBoundary>
          <BrowserRouter>
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          </BrowserRouter>
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  )
}
