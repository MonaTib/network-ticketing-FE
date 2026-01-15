import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import TicketList from "./pages/TicketList";
import TicketHistory from "./pages/TicketHistory";
import CreateTicket from "./pages/CreateTicket";
import CustomerSummary from "./pages/CustomerSummary";
import EngineerSummary from "./pages/EngineerSummary";
import Feedback from "./pages/Feedback";
import ViewFeedback from "./pages/ViewFeedback";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ DASHBOARDS
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AgentDashboard from "./pages/dashboard/AgentDashboard";
import EngineerDashboard from "./pages/dashboard/EngineerDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import "./styles/global.css";

// ✅ ROLE BASED DASHBOARD SELECTOR
function DashboardRouter() {
  const role = (localStorage.getItem("role") || "").toUpperCase();

  if (role === "ADMIN") return <AdminDashboard />;
  if (role === "AGENT") return <AgentDashboard />;
  if (role === "ENGINEER") return <EngineerDashboard />;
  if (role === "CUSTOMER") return <CustomerDashboard />;

  return <Unauthorized />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PROTECTED APP */}
        <Route
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        >
          {/* ✅ ONE DASHBOARD ENTRY POINT */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          <Route path="/tickets" element={<TicketList />} />
          <Route path="/admin/customers" element={<CustomerSummary />} />
          <Route path="/admin/engineers" element={<EngineerSummary />} />
<Route path="/tickets/:ticketId/history" element={<TicketHistory />} />
          <Route path="/create-ticket" element={<CreateTicket />} />
          

          <Route
            path="/tickets/:ticketId/history"
            element={
              localStorage.getItem("role") == "CUSTOMER" ? <Navigate to="/tickets" replace /> : <TicketHistory />
            }
          />

          <Route
            path="/tickets/:ticketId/feedback"
            element={<Feedback />}
          />

          <Route
            path="/tickets/:ticketId/view-feedback"
            element={<ViewFeedback />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
