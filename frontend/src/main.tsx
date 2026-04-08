import React, { useContext, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './index.css'
import LoginPage from './LoginPage.tsx'
import RegisterPage from './RegisterPage.tsx'
import Dashboard from './Dashboard.tsx'
import SearchScreen from './SearchScreen.tsx'
import LogCallScreen from './LogCallScreen.tsx'
import Header from './Header.tsx'
import { AuthProvider, AuthContext } from './AuthContext.tsx'
import { CallHistoryProvider } from './CallHistoryContext.tsx'

// A wrapper component to protect routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const Layout = () => (
  <>
    <Header />
    <Outlet />
  </>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CallHistoryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="search" element={<SearchScreen />} />
              <Route path="log-call" element={<LogCallScreen />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </CallHistoryProvider>
    </AuthProvider>
  </StrictMode>,
)
