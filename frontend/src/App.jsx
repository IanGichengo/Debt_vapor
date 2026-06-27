// src/App.jsx

import { Routes, Route, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google'; // <-- NEW IMPORT
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Solutions from "./pages/Solutions";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Additional Public Pages (Placeholders)
import HelpCenter from "./pages/HelpCenterPublic";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import MyAccount from "./pages/MyAccount";
import Debtors from "./pages/Debtors";
import DebtorProfile from "./pages/DebtorProfile";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import HelpCenterDashboard from "./pages/HelpCenter"; // Renamed to avoid conflict

// Layouts & Components
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Layout Component (with Navbar)
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  // We grab the Client ID from your environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    // Wrap the entire app in the Google OAuth Provider
    <GoogleOAuthProvider clientId={googleClientId}>
      <ScrollToTop />
      <Routes>
        {/* Public routes with Navbar */}
        <Route element={<PublicLayout />}>
          {/* Home & Marketing Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Additional Public Pages */}
          <Route path="/help-center-public" element={<HelpCenter />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected dashboard routes (uses DashboardLayout without public Navbar) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="debtors" element={<Debtors />} />
          <Route path="debtors/:id" element={<DebtorProfile />} />
          <Route path="account" element={<MyAccount />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="help" element={<HelpCenterDashboard />} />
        </Route>
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
