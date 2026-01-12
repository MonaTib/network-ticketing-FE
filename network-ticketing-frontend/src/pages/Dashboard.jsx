import { useEffect, useState } from "react";
import api from "../utils/axios";


export default function Dashboard() {
  const role = (localStorage.getItem("role") || "").toUpperCase();

  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === "ADMIN") {
      fetchCounts();
    }
    // eslint-disable-next-line
  }, [role]);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tickets/report/counts");
      setCounts(res.data);
    } catch (err) {
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-card">
      <h2>Dashboard 📊</h2>

      {/* ================= ADMIN DASHBOARD ================= */}
      {role === "ADMIN" && (
        <>
          <p>System overview and SLA monitoring</p>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : !counts ? (
            <p>No data available</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginTop: "20px"
              }}
            >
              <StatCard
                title="Total Tickets"
                value={counts.TOTAL}
                type="neutral"
              />

              <StatCard
                title="Open Tickets"
                value={counts.OPEN}
                type="open"
              />

              <StatCard
                title="In Progress"
                value={counts.IN_PROGRESS}
                type="progress"
              />

              <StatCard
                title="Resolved Tickets"
                value={counts.RESOLVED}
                type="resolved"
              />

              <StatCard
                title="SLA Active ⏳"
                value={counts.SLA_ACTIVE}
                type="slaActive"
              />

              <StatCard
                title="Closed Tickets 🔒"
                value={counts.CLOSED}
                type="closed"
              />

              <StatCard
                title="SLA Breached ❌"
                value={counts.SLA_BREACHED}
                type="slaBreached"
              />
            </div>
          )}
        </>
      )}

      {/* ================= NON-ADMIN ================= */}
      {role !== "ADMIN" && (
        <p>Welcome to the ticketing system.</p>
      )}
    </div>
  );
}

/* ================= DASHBOARD CARD ================= */

function StatCard({ title, value, type }) {
  const colors = {
    neutral: "#93b4e3ff",
    open: "#17234aff",
    progress: "#574938ff",
    resolved: "#1a2d21ff",
    closed: "#2e2e3a",
    slaActive: "#4d6f6cff",
    slaBreached: "#693535ff"
  };

  return (
    <div
      style={{
        padding: "22px",
        borderRadius: "14px",
        background: colors[type] || "#1e293b",
        color: "#f8fafc",
        textAlign: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)"
      }}
    >
      <h4 style={{ marginBottom: "10px" }}>{title}</h4>
      <p style={{ fontSize: "28px", fontWeight: "bold" }}>
        {value ?? 0}
      </p>
    </div>
  );
}
