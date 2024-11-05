import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";

// Import pages
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import PollsPage from "../pages/Dashboards/PollsPage";
import PollPage from "../pages/Dashboards/PollPage";
import CreatePollPage from "../pages/Dashboards/CreatePollPage";
import AdminDashboard from "../pages/Dashboards/AdminDashBoard";
import UserProfilePage from "../pages/Dashboards/UserProfilePage";
import ErrorPage from "../pages/ErrorPage";
import ManagePollsPage from "@/pages/Dashboards/ManagePollsPage";
import EditPoll from "@/pages/Dashboards/EditPoll";
import ContactUSPage from "../pages/ContactUsPage";
import AboutUsPage from "@/pages/AboutUsPage";
import DashboardLayout from "@/pages/Dashboards/DashBoardLayout";
import VoterDashboard from "@/pages/Dashboards/VoterDashBoard";
import RoleManagement from "@/pages/Dashboards/RoleManagement";
import UserManagement from "@/pages/Dashboards/UserManagement";
import Reports from "@/pages/Dashboards/Reports";
import Settings from "@/pages/Settings";
import AuditLogs from "@/pages/Dashboards/AuditLogs";
import VotingHistory from "@/pages/Dashboards/VotingHistory";

// Private Route Component
const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/error" />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return children;
  }

  // Redirect based on role
  if (user.role === "admin") {
    return <Navigate to="/dashboard/admin" />;
  }
  
  if (user.role === "voter") {
    return <Navigate to="/dashboard/voter" />;
  }

  // Fallback in case of unrecognized role
  return <Navigate to="/error" />;
};

const MainRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      {/* <Route path="/contactus" element={<ContactUSPage />} /> */}
      <Route path="/aboutus" element={<AboutUsPage />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="admin" element={<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="manage-users" element={<PrivateRoute requiredRole="admin"><UserManagement /></PrivateRoute>} />
        <Route path="manage-roles" element={<PrivateRoute requiredRole="admin"><RoleManagement /></PrivateRoute>} />
        <Route path="voter" element={<PrivateRoute requiredRole="voter"><PollsPage /></PrivateRoute>} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="poll/:pollId" element={<PollPage />} />
        <Route path="polls" element={<PollsPage />} />
        <Route path="voting-history" element={<VotingHistory />} />
        <Route path="poll/:pollId/edit" element={<PrivateRoute requiredRole="admin" ><EditPoll /></PrivateRoute>}/>
        <Route path="managepolls" element={<PrivateRoute requiredRole="admin"><ManagePollsPage /></PrivateRoute>} />
        <Route path="createpolls" element={<PrivateRoute requiredRole="admin"><CreatePollPage /></PrivateRoute>} />
        <Route path="reports" element={<PrivateRoute requiredRole="admin"><Reports /></PrivateRoute>} />
        <Route path="settings" element={<PrivateRoute requiredRole="admin"><Settings /></PrivateRoute>} />
        <Route path="logs" element={<PrivateRoute requiredRole="admin"><AuditLogs /></PrivateRoute>} />
      </Route>
      
      {/* Error Page (Fallback for 404) */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default MainRoutes;