import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Create a new QueryClient instance with optimized settings for AI operations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - AI results stay fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - cache duration (replaces cacheTime in v5)
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when internet reconnects
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          
          {/* Toast notifications for AI operations */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px'
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981', // Green
                  secondary: '#ffffff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444', // Red
                  secondary: '#ffffff',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#3B82F6', // Blue
                  secondary: '#ffffff',
                },
              },
            }}
          />
          
          {/* React Query DevTools - only shows in development */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools 
              initialIsOpen={false}
              position="bottom-right"
            />
          )}
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
