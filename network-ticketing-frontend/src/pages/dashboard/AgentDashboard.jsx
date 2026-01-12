import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function AgentDashboard() {
  const [counts, setCounts] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await api.get("/api/tickets");
      const all = Array.isArray(res.data) ? res.data : [];

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

  if (!counts) return <p>Loading dashboard...</p>;

  return (
    <div className="dark-card">
      <h2>Agent Dashboard 🧑‍💼</h2>

      <div className="dashboard-cards" style={{ marginTop: 20 }}>
        <Card
          title="Total Tickets"
          value={counts.TOTAL}
          className="card-total"
          onClick={() => navigate("/tickets")}
        />
        <Card
          title="Open"
          value={counts.OPEN}
          className="card-open"
          onClick={() => navigate("/tickets?status=OPEN")}
        />
        <Card
          title="In Progress"
          value={counts.IN_PROGRESS}
          className="card-progress"
          onClick={() => navigate("/tickets?status=IN_PROGRESS")}
        />
        <Card
          title="Resolved"
          value={counts.RESOLVED}
          className="card-resolved"
          onClick={() => navigate("/tickets?status=RESOLVED")}
        />
        <Card
          title="Closed"
          value={counts.CLOSED}
          className="card-closed"
          onClick={() => navigate("/tickets?status=CLOSED")}
        />
      </div>
    </div>
  );
}

function Card({ title, value, onClick, className }) {
  return (
    <div className={`dashboard-card ${className}`} onClick={onClick}>
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
}
