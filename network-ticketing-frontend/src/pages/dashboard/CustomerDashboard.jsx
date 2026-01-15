import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/tickets");
        const data = Array.isArray(res.data) ? res.data : [];
        // Filter for this specific customer
        setTickets(data.filter(t => t.customer?.id === Number(userId)));
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, [userId]);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "OPEN").length,
    progress: tickets.filter(t => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter(t => t.status === "RESOLVED").length,
    closed: tickets.filter(t => t.status === "CLOSED").length,
  };

  return (
    <div className="app-container">
      {/* 1. Professional Navbar
      <nav className="enterprise-navbar">
        <div className="nav-brand">SupportPortal ⚡</div>
        <div className="nav-links">
          <button onClick={() => navigate('/dashboard')} className="nav-item active">Dashboard</button>
          <button onClick={() => navigate('/create-ticket')} className="nav-item">Create Ticket</button>
          <button onClick={() => navigate('/tickets')} className="nav-item">My Tickets</button>
        </div>
        <button className="logout-pill" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
      </nav> */}

      {/* 2. Welcome Header */}
      <div className="page-header">
        <h1>Customer Dashboard</h1>
        <p>System status: <span className="text-success" style={{color: '#4ade80'}}>All services operational ✅</span></p>
      </div>

      {/* 3. Status Cards Row */}
      <div className="dashboard-cards">
        <div className="dashboard-card card-total" onClick={() => navigate('/tickets')}>
          <h4>Total Tickets</h4>
          <p>{stats.total}</p>
        </div>
        <div className="dashboard-card card-open" onClick={() => navigate('/tickets?status=OPEN')}>
          <h4>Open</h4>
          <p>{stats.open}</p>
        </div>
        <div className="dashboard-card card-progress" onClick={() => navigate('/tickets?status=IN_PROGRESS')}>
          <h4>In Progress</h4>
          <p>{stats.progress}</p>
        </div>
        <div className="dashboard-card card-resolved" onClick={() => navigate('/tickets?status=RESOLVED')}>
          <h4>Resolved</h4>
          <p>{stats.resolved}</p>
        </div>
      </div>

      {/* 4. Enterprise Grid Section */}
      <div className="dashboard-grid">
        {/* Recent Activity Timeline */}
        <div className="dark-card activity-section">
          <h3>Recent Updates 🕒</h3>
          <div className="timeline">
            {tickets.slice(0, 3).map((t) => (
              <div key={t.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <strong>{t.ticketId || `T-${t.id}`}: {t.description.substring(0, 30)}...</strong>
                  <p>Current Status: <span className={`status-badge status-${t.status}`}>{t.status}</span></p>
                  <small>Updated recently</small>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p style={{color: '#94a3b8'}}>No recent activity found.</p>}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="dark-card quick-actions">
          <h3>Quick Support ⚡</h3>
          <button className="btn-primary-large" onClick={() => navigate('/create-ticket')}>
            + Submit New Request
          </button>
          <div className="info-box">
            <h4>Support Metrics</h4>
            <p>Avg. Response: <strong>1.5 Hours</strong></p>
            <p>Active Engineers: <strong>Online</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}