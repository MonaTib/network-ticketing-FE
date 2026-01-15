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
      console.error("Error loading ticket history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: "20px", color: "white" }}>Loading details...</p>;
  if (!ticket) return <p style={{ padding: "20px", color: "white" }}>Ticket not found.</p>;

  return (
    <div className="dark-card" style={{ padding: "20px", color: "white" }}>
      
      {/* 1. Header Section */}
      <h2 style={{ marginBottom: "20px" }}>
        Ticket Details: {ticket.ticketId || ticket.id} 📄
      </h2>

      <button 
        onClick={() => navigate("/tickets")} 
        style={{ marginBottom: "20px", padding: "8px 15px", cursor: "pointer" }}
      >
        ← Back to List
      </button>

      {/* 2. Top Section: Ticket Details Table */}
      {/* This section remains visible to everyone: Admin, Engineer, Agent, and Customer */}
      <div style={{ marginBottom: "30px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#1e293b", borderRadius: "8px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "12px", borderBottom: "1px solid #334155", width: "200px", fontWeight: "bold" }}>Ticket ID</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #334155" }}>{ticket.ticketId || ticket.id}</td>
            </tr>
            <tr>
              <td style={{ padding: "12px", borderBottom: "1px solid #334155", fontWeight: "bold" }}>Description</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #334155" }}>{ticket.description}</td>
            </tr>
            <tr>
              <td style={{ padding: "12px", borderBottom: "1px solid #334155", fontWeight: "bold" }}>Status</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #334155" }}>
                <span className={`status-dot status-${String(ticket.status).toUpperCase()}`}></span>
                {ticket.status}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "12px", borderBottom: "1px solid #334155", fontWeight: "bold" }}>Created At</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #334155" }}>
                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Bottom Section: Activity History Timeline */}
      {/* ✅ UPDATED ROLE CHECK: This section is now hidden for AGENT, CUSTOMER, and ENGINEER */}
      {role === "ADMIN" && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "20px", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
            Activity History
          </h3>
          
          {history.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No activity recorded yet.</p>
          ) : (
            <div style={{ borderLeft: "2px solid #3b82f6", marginLeft: "10px", paddingLeft: "20px" }}>
              {history.map((log, i) => (
                <div key={i} style={{ 
                  marginBottom: "25px", 
                  position: "relative",
                  padding: "10px",
                  backgroundColor: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "4px"
                }}>
                  {/* Timeline Dot */}
                  <div style={{
                    position: "absolute",
                    left: "-27px",
                    top: "15px",
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#3b82f6",
                    borderRadius: "50%",
                    border: "2px solid #0f172a"
                  }}></div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ color: "#60a5fa", fontSize: "1.05em" }}>
                      {log.action?.replace(/_/g, " ")}
                    </strong>
                    <small style={{ color: "#94a3b8" }}>
                      {new Date(log.actionTime).toLocaleString()}
                    </small>
                  </div>
                  
                  <p style={{ margin: "5px 0", color: "#cbd5e1" }}>
                    {log.details}
                  </p>
                  
                  {log.performedBy && (
                    <small style={{ color: "#64748b" }}>
                      By: {log.performedBy.name || log.performedBy.username}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}