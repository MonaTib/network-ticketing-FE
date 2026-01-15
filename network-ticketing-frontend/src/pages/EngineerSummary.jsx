import { useEffect, useState } from "react";
import api from "../utils/axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function EngineerSummary() {
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔒 ADMIN ONLY check
  if (role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tickets");
      const tickets = Array.isArray(res.data) ? res.data : [];

      const map = {};

      tickets.forEach(t => {
        if (!t.assignedEngineer) return;

        const id = t.assignedEngineer.id;
        const name =
          t.assignedEngineer.name ||
          t.assignedEngineer.username ||
          t.assignedEngineer.email;

        if (!map[id]) {
          map[id] = {
            id,
            name,
            assigned: 0,
            inProgress: 0,
            resolved: 0,
            breached: 0
          };
        }

        map[id].assigned++;
        if (t.status === "IN_PROGRESS") map[id].inProgress++;
        if (t.status === "RESOLVED" || t.status === "CLOSED") map[id].resolved++;
        if (t.slaBreached) map[id].breached++;
      });

      setSummary(Object.values(map));
    } catch {
      alert("Failed to load engineer summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>👨‍🔧 Engineer Workload Summary</h1>
        <p>Real-time resource allocation and resolution performance.</p>
      </div>

      {loading ? (
        <p className="loading-text">Analyzing Engineer Data...</p>
      ) : summary.length === 0 ? (
        <p className="loading-text">No active data available.</p>
      ) : (
        <div className="summary-grid">
          {summary.map(e => (
            <div key={e.id} className="summary-card">
              <h3>{e.name}</h3>
              <div className="summary-stats">
                <p>Assigned: <strong>{e.assigned}</strong></p>
                <p>In Progress: <strong>{e.inProgress}</strong></p>
                <p>Resolved: <strong>{e.resolved}</strong></p>
                <p style={{ color: e.breached > 0 ? '#f87171' : '#94a3b8' }}>
                  SLA Breached: <strong>{e.breached}</strong>
                </p>
              </div>

              <button
                className="btn-action-sm"
                onClick={() => navigate(`/tickets?engineerId=${e.id}`)}
              >
                View Tickets
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}