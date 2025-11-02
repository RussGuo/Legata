import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/tailwind.css'
import Landing from './app/routes/Landing'
import AppShell from './app/routes/AppShell'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/app', element: <AppShell /> },
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

