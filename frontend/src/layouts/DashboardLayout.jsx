import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100"> {/* Change min-h-screen to h-screen and add overflow-hidden */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto"> {/* Remove p-6 here, we'll add it to pages instead */}
        <Outlet />
      </main>
    </div>
  );
}
