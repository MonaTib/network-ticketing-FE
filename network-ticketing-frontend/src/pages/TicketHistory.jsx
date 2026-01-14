import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";

export default function TicketHistory() {
  const { ticketId: paramId } = useParams(); 
  const navigate = useNavigate();
  const role = (localStorage.getItem("role") || "").toUpperCase();

  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paramId) fetchData();
  }, [paramId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, historyRes] = await Promise.all([
        api.get(`/api/tickets/${paramId}`),
        api.get(`/api/tickets/${paramId}/history`)
      ]);
      setTicket(ticketRes.data);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (err) {
      alert("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading ticket details...</p>;
  if (!ticket) return <p style={{ padding: 20 }}>Ticket not found.</p>;

  return (
    <div className="dark-card">
      {/* ✅ Displays T-001 in Title */}
      <h2>Ticket Details: {ticket.ticketId || ticket.id} 📄</h2>

      <button onClick={() => navigate("/tickets")}>← Back to List</button>

      <table style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "10px", borderBottom: "1px solid #444", width: '200px' }}><b>Ticket ID</b></td>
            {/* ✅ Displays T-001 in Table */}
            <td style={{ padding: "10px", borderBottom: "1px solid #444" }}>
                {ticket.ticketId || ticket.id}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "10px", borderBottom: "1px solid #444" }}><b>Description</b></td>
            <td style={{ padding: "10px", borderBottom: "1px solid #444" }}>{ticket.description}</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", borderBottom: "1px solid #444" }}><b>Status</b></td>
            <td style={{ padding: "10px", borderBottom: "1px solid #444" }}>
                <span className={`status-dot status-${String(ticket.status).toUpperCase()}`}></span>
                {ticket.status}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "10px", borderBottom: "1px solid #444" }}><b>Created At</b></td>
            <td style={{ padding: "10px", borderBottom: "1px solid #444" }}>
                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "N/A"}
            </td>
          </tr>
          {role === "ENGINEER" && history.length > 0 && (
            <tr>
              <td style={{ padding: "10px", borderBottom: "1px solid #444" }}><b>Assigned At</b></td>
              <td style={{ padding: "10px", borderBottom: "1px solid #444" }}>
                {history[0]?.actionTime ? new Date(history[0].actionTime).toLocaleString() : "N/A"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ACTIVITY LOG SECTION (Visible for Admin/Agent) */}
      {role !== "CUSTOMER" && history.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Activity History</h3>
          <div style={{ background: "#1e293b", padding: "15px", borderRadius: "8px" }}>
            {history.map((log, i) => (
              <div key={i} style={{ padding: "10px", borderLeft: "2px solid #3b82f6", marginBottom: "10px", marginLeft: "10px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{log.action?.replace(/_/g, ' ')}</strong>
                  <small style={{ color: '#94a3b8' }}>{new Date(log.actionTime).toLocaleString()}</small>
                </div>
                <p style={{ margin: "5px 0", color: "#cbd5e1", fontSize: "0.9em" }}>{log.details}</p>
                {log.performedBy && <small style={{ color: '#64748b' }}>By: {log.performedBy.name}</small>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}