import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await api.get("/api/tickets");
      const all = Array.isArray(res.data) ? res.data : [];

      const now = new Date();

      const slaActive = all.filter(
        t => t.slaDueTime && new Date(t.slaDueTime) > now
      ).length;

      const slaBreached = all.filter(
        t => t.slaDueTime && new Date(t.slaDueTime) <= now
      ).length;

      setCounts({
        TOTAL: all.length,
        OPEN: all.filter(t => t.status === "OPEN").length,
        IN_PROGRESS: all.filter(t => t.status === "IN_PROGRESS").length,
        RESOLVED: all.filter(t => t.status === "RESOLVED").length,
        CLOSED: all.filter(t => t.status === "CLOSED").length,
        SLA_ACTIVE: slaActive,
        SLA_BREACHED: slaBreached
      });
    } catch {
      alert("Failed to load admin dashboard");
    }
  };

  if (!counts) return <p>Loading dashboard...</p>;

  return (
    <div className="dark-card">
      <h2>Admin Dashboard 📊</h2>

      <div className="dashboard-cards" style={{ marginTop: 20 }}>
        <Card
          title="Total Tickets"
          value={counts.TOTAL}
          className="card-total"
          onClick={() => navigate("/tickets")}
        />

        <Card
          title="Open Tickets"
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
          title="Resolved Tickets"
          value={counts.RESOLVED}
          className="card-resolved"
          onClick={() => navigate("/tickets?status=RESOLVED")}
        />

        <Card
          title="Closed Tickets"
          value={counts.CLOSED}
          className="card-closed"
          onClick={() => navigate("/tickets?status=CLOSED")}
        />

        <Card
          title="SLA Active ⏳"
          value={counts.SLA_ACTIVE}
          className="card-sla-active"
          onClick={() => navigate("/tickets?sla=ACTIVE")}
        />

        <Card
          title="SLA Breached ❌"
          value={counts.SLA_BREACHED}
          className="card-sla-breached"
          onClick={() => navigate("/tickets?sla=BREACHED")}
        />
      </div>
    </div>
  );
}

function Card({ title, value, className, onClick }) {
  return (
    <div className={`dashboard-card ${className}`} onClick={onClick}>
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
}
