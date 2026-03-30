import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/login';
import Admin from './pages/Admin';

// Wraps any route with auth check
function PrivateRoute({ children, requiredRole }: { children: JSX.Element; requiredRole?: string }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">Authenticating...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute requiredRole="admin">
            <Admin />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}