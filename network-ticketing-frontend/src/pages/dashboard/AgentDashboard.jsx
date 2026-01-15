import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function AgentDashboard() {
  const [counts, setCounts] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/api/tickets");
      const all = Array.isArray(res.data) ? res.data : [];

      // Logic derived from Status Card values
      setCounts({
        TOTAL: all.length,
        OPEN: all.filter(t => t.status === "OPEN").length,
        IN_PROGRESS: all.filter(t => t.status === "IN_PROGRESS").length,
        RESOLVED: all.filter(t => t.status === "RESOLVED").length,
        CLOSED: all.filter(t => t.status === "CLOSED").length
      });
    } catch {
      alert("Failed to load agent dashboard");
    }
  };

  if (!counts) return <p className="loading-text">Loading Dashboard...</p>;

  return (
    <div className="app-container">
      {/* Page Header */}
      <div className="page-header">
        <h1>Agent Dashboard 🧑‍💼</h1>
      </div>

      {/* Main Status Cards Logic */}
      <div className="dashboard-cards" style={{ marginTop: '20px' }}>
        <div className="dashboard-card card-total" onClick={() => navigate("/tickets")}>
          <h4>TOTAL TICKETS</h4>
          <p>{counts.TOTAL}</p>
        </div>
        
        <div className="dashboard-card card-open" onClick={() => navigate("/tickets?status=OPEN")}>
          <h4>OPEN</h4>
          <p>{counts.OPEN}</p>
        </div>

        <div className="dashboard-card card-progress" onClick={() => navigate("/tickets?status=IN_PROGRESS")}>
          <h4>IN PROGRESS</h4>
          <p>{counts.IN_PROGRESS}</p>
        </div>

        <div className="dashboard-card card-resolved" onClick={() => navigate("/tickets?status=RESOLVED")}>
          <h4>RESOLVED</h4>
          <p>{counts.RESOLVED}</p>
        </div>

        <div className="dashboard-card card-closed" onClick={() => navigate("/tickets?status=CLOSED")}>
          <h4>CLOSED</h4>
          <p>{counts.CLOSED}</p>
        </div>
      </div>
    </div>
  );
}