import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function EngineerDashboard() {
  const [tickets, setTickets] = useState([]); // Stores raw ticket data for the table
  const [counts, setCounts] = useState(null); // Stores counts for the cards
  const navigate = useNavigate();

  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/tickets");
      const all = Array.isArray(res.data) ? res.data : [];

      // Filter for this specific engineer
      const myTickets = all.filter(t => t.assignedEngineer?.id === userId);
      setTickets(myTickets);

      // Maintain your existing count logic
      setCounts({
        IN_PROGRESS: myTickets.filter(t => t.status === "IN_PROGRESS").length,
        RESOLVED: myTickets.filter(t => t.status === "RESOLVED").length,
        CLOSED: myTickets.filter(t => t.status === "CLOSED").length
      });
    } catch {
      alert("Failed to load engineer dashboard");
    }
  };

  if (!counts) return <p className="loading-text">Loading dashboard...</p>;

  return (
    <div className="app-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Engineer Command Center 🛠️</h1>
        <p>Currently managing <strong>{counts.IN_PROGRESS}</strong> active assignments.</p>
      </div>

      {/* 2. Efficiency Metrics (Existing Card Logic) */}
      <div className="dashboard-cards">
        <div 
          className="dashboard-card card-progress" 
          onClick={() => navigate("/tickets?status=IN_PROGRESS")}
        >
          <h4>In Progress</h4>
          <p>{counts.IN_PROGRESS}</p>
          <div className="card-trend trend-up">Focus Required</div>
        </div>

        <div 
          className="dashboard-card card-resolved" 
          onClick={() => navigate("/tickets?status=RESOLVED")}
        >
          <h4>Resolved</h4>
          <p>{counts.RESOLVED}</p>
          <div className="card-trend trend-up">▲ 5% this week</div>
        </div>

        <div 
          className="dashboard-card card-total" 
          onClick={() => navigate("/tickets?status=CLOSED")}
        >
          <h4>SLA Met Rate</h4>
          <p>94%</p>
          <div className="card-trend trend-up">Target: 90%</div>
        </div>
      </div>

      {/* 3. Workspace Grid (New Enterprise UI) */}
      <div className="dashboard-grid">
        {/* Left: Priority Queue */}
        <div className="dark-card">
          <h3>My Assigned Queue 📋</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Priority</th>
                <th>Subject</th>
                <th>SLA Due</th>
                {/* ADDED: Actions Column Header */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.filter(t => t.status !== 'CLOSED').slice(0, 5).map(t => (
                <tr key={t.id}>
                  {/* Format matching your T-001 requirement */}
                  <td className="id-column" style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    {t.ticketId || `T-${String(t.id).padStart(3, '0')}`}
                  </td>
                  <td>
                    <span className={`priority-pill ${t.priority?.toLowerCase() || 'medium'}`}>
                      {t.priority || 'Medium'}
                    </span>
                  </td>
                  <td>{t.description?.substring(0, 30)}...</td>
                  <td><span className="text-warning">1.4 Hours</span></td>
                  {/* ADDED: Action button for History navigation */}
                  <td>
                    <button 
                      className="btn-action" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => navigate(`/tickets/${t.id}/history`)}
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No active tickets assigned.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right: Team Operations Feed */}
        <div className="dark-card activity-section">
          <h3>Team Operations Feed 🛰️</h3>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <strong>System Health</strong>
                <p>Global network latency is within normal parameters.</p>
                <small>Just now</small>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" style={{ backgroundColor: '#facc15' }}></div>
              <div className="timeline-content">
                <strong>Engineer Notice</strong>
                <p>Evening shift handover is complete.</p>
                <small>45 mins ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}