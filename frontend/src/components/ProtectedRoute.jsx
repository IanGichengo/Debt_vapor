import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // show a loading screen instead of returning null
  if (loading) return <div>Loading...</div>;

  // redirect if user is null
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
