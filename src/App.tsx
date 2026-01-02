import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useConfig } from './contexts/ConfigContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { UserRegistration } from './pages/auth/UserRegistration';
import { TermsAndConditions } from './pages/auth/TermsAndConditions';

// App Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { ChartsPage } from './pages/charts/ChartsPage';
import { Profile } from './pages/profile/Profile';
import { UniversalCRUD } from './pages/patients/UniversalCRUD';
import { OfficeList } from './pages/offices/OfficeList';
import { ConsultationList } from './pages/consultations/ConsultationList';
import { InvoiceList } from './pages/billing/InvoiceList';
import { ReportsPage } from './pages/reports/ReportsPage';
import { UserManagement } from './pages/users/UserManagement';
import { HelpPage } from './pages/help/HelpPage';

function App() {
  const { config } = useConfig();
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/terms" element={<TermsAndConditions />} />

          {/* Dynamic Entity Routes */}
          {config.entities.map(entity => (
            <Route
              key={entity.name}
              path={`/${entity.name}`}
              element={
                <ProtectedRoute>
                  <UniversalCRUD config={entity} />
                </ProtectedRoute>
              }
            />
          ))}

          {/* Hardcoded Dashboard & Other Static Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charts"
            element={
              <ProtectedRoute>
                <ChartsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offices"
            element={
              <ProtectedRoute>
                <OfficeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultations"
            element={
              <ProtectedRoute>
                <ConsultationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;