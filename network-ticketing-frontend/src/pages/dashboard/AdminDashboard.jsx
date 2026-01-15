import { useEffect, useState, useCallback } from "react";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const navigate = useNavigate();

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await api.get("/api/tickets");
      const all = Array.isArray(res.data) ? res.data : [];
      const now = new Date();

      setCounts({
        TOTAL: all.length,
        OPEN: all.filter(t => t.status === "OPEN").length,
        IN_PROGRESS: all.filter(t => t.status === "IN_PROGRESS").length,
        RESOLVED: all.filter(t => t.status === "RESOLVED").length,
        CLOSED: all.filter(t => t.status === "CLOSED").length,
        SLA_BREACHED: all.filter(t => t.slaBreached === true).length,
        SLA_ACTIVE: all.filter(t => t.status === "IN_PROGRESS" && t.slaDueTime && new Date(t.slaDueTime) > now).length,
      });
    } catch (err) {
      console.error("Failed to load metrics", err);
    }
  }, []);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

  if (!counts) return <p className="loading-text">Loading Dashboard...</p>;

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>Admin Command Center 🏛️</h1>
      </div>

      <div className="dashboard-cards">
        <Card title="TOTAL TICKETS" value={counts.TOTAL} className="card-total" label="Global Volume" onClick={() => navigate("/tickets")} />
        <Card title="OPEN" value={counts.OPEN} className="card-open" label="Awaiting Dispatch" onClick={() => navigate("/tickets?status=OPEN")} />
        <Card title="SLA BREACHED" value={counts.SLA_BREACHED} className="card-sla-breached" label="Action Required" onClick={() => navigate("/tickets?status=SLA_BREACHED")} />
        <Card title="IN PROGRESS" value={counts.IN_PROGRESS} className="card-progress" label="Active" onClick={() => navigate("/tickets?status=IN_PROGRESS")} />
      </div>

      <div className="dashboard-cards" style={{ marginTop: '20px' }}>
        <Card title="SLA ACTIVE ⏳" value={counts.SLA_ACTIVE} className="card-sla-active" label="On Schedule" onClick={() => navigate("/tickets?status=SLA_ACTIVE")} />
        <Card title="RESOLVED" value={counts.RESOLVED} className="card-resolved" label="Verified" onClick={() => navigate("/tickets?status=RESOLVED")} />
        <Card title="CLOSED" value={counts.CLOSED} className="card-total" label="Archived" onClick={() => navigate("/tickets?status=CLOSED")} />
      </div>
    </div>
  );
}

function Card({ title, value, className, label, onClick }) {
  return (
    <div className={`dashboard-card ${className}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <h4>{title}</h4>
      <p style={{ fontSize: '28px', fontWeight: '800' }}>{value}</p>
      <div className="card-trend">{label}</div>
    </div>
  );
}