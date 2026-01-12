import { useEffect, useState } from "react";
import api from "../utils/axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function EngineerSummary() {
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔒 ADMIN ONLY
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
        if (t.status === "RESOLVED" || t.status === "CLOSED")
          map[id].resolved++;
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
    <div className="summary-page">
      <h2>👨‍🔧 Engineer Summary</h2>

      {loading ? (
        <p>Loading...</p>
      ) : summary.length === 0 ? (
        <p>No data</p>
      ) : (
        <div className="summary-grid">
          {summary.map(e => (
            <div
              key={e.id}
              style={{
                width: 260,
                padding: 16,
                border: "1px solid #ccc",
                borderRadius: 8
              }}
            >
              <h4>{e.name}</h4>
              <p>Assigned: {e.assigned}</p>
              <p>In Progress: {e.inProgress}</p>
              <p>Resolved: {e.resolved}</p>
              <p>SLA Breached: {e.breached}</p>

              <button
                onClick={() =>
                  navigate(`/tickets?engineerId=${e.id}`)
                }
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
