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

      // 1. SLA Active: Clock still running (In Progress and deadline is future)
      const slaActive = all.filter(
        t => t.status === "IN_PROGRESS" && t.slaDueTime && new Date(t.slaDueTime) > now
      ).length;

      // 2. SLA Breached: Explicitly marked as breached by system
      const slaBreached = all.filter(t => t.slaBreached === true).length;

      // 3. SLA Met: Resolved/Closed and NOT breached
      const slaMet = all.filter(
        t => (t.status === "RESOLVED" || t.status === "CLOSED") && t.slaBreached === true
      ).length;

      setCounts({
        TOTAL: all.length,
        OPEN: all.filter(t => t.status === "OPEN").length,
        IN_PROGRESS: all.filter(t => t.status === "IN_PROGRESS").length,
        RESOLVED: all.filter(t => t.status === "RESOLVED").length,
        CLOSED: all.filter(t => t.status === "CLOSED").length,
        SLA_ACTIVE: slaActive,
        SLA_BREACHED: slaBreached,
        SLA_MET: slaMet
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
        <Card title="Total Tickets" value={counts.TOTAL} className="card-total" onClick={() => navigate("/tickets")} />
        <Card title="Open Tickets" value={counts.OPEN} className="card-open" onClick={() => navigate("/tickets?status=OPEN")} />
        <Card title="In Progress" value={counts.IN_PROGRESS} className="card-progress" onClick={() => navigate("/tickets?status=IN_PROGRESS")} />
        <Card title="Resolved Tickets" value={counts.RESOLVED} className="card-resolved" onClick={() => navigate("/tickets?status=RESOLVED")} />
        <Card title="Closed Tickets" value={counts.CLOSED} className="card-closed" onClick={() => navigate("/tickets?status=CLOSED")} />
        
        {/* SLA CARDS */}
        <Card title="SLA Active ⏳" value={counts.SLA_ACTIVE} className="card-sla-active" onClick={() => navigate("/tickets?status=SLA_ACTIVE")} />
        <Card title="SLA Met ✅" value={counts.SLA_MET} className="card-sla-met" onClick={() => navigate("/tickets?status=SLA_MET")} />
        <Card title="SLA Breached ❌" value={counts.SLA_BREACHED} className="card-sla-breached" onClick={() => navigate("/tickets?status=SLA_BREACHED")} />
      </div>
    </div>
  );
}

function Card({ title, value, className, onClick }) {
  return (
    <div className={`dashboard-card ${className}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <h4>{title}</h4>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</p>
    </div>
  );
}