import { Route, Routes } from 'react-router'

export default () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <p>Hello World</p>
          </>
        }
      />
    </Routes>
  )
}
