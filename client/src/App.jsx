import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import RoomDetailPage from './pages/RoomDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import DashboardPage from './pages/DashboardPage';
import ManageHousesRoomsPage from './pages/ManageHousesRoomsPage';
import ManageContractsPage from './pages/ManageContractsPage';
import BulkUtilityPage from './pages/BulkUtilityPage';
import ManageInvoicesPage from './pages/ManageInvoicesPage';
import ManageRepairsPage from './pages/ManageRepairsPage';
import TenantPortalPage from './pages/TenantPortalPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            {/* Tuyến đường công khai */}
            <Route path="/" element={<HomePage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Tuyến đường dành cho Chủ trọ */}
            <Route
              path="/landlord/dashboard"
              element={
                <ProtectedRoute allowedRole="landlord">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/houses-rooms"
              element={
                <ProtectedRoute allowedRole="landlord">
                  <ManageHousesRoomsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/contracts"
              element={
                <ProtectedRoute allowedRole="landlord">
                  <ManageContractsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/bulk-utility"
              element={
                <ProtectedRoute allowedRole="landlord">
                  <BulkUtilityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/invoices"
              element={
                <ProtectedRoute allowedRole="landlord">
                  <ManageInvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/repairs"
              element={
                <ProtectedRoute allowedRole="landlord">
                  <ManageRepairsPage />
                </ProtectedRoute>
              }
            />

            {/* Tuyến đường dành cho Người thuê */}
            <Route
              path="/tenant"
              element={
                <ProtectedRoute allowedRole="tenant">
                  <TenantPortalPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;