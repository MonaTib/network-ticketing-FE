import { useEffect, useState, useCallback } from "react";
import api from "../utils/axios";
import { useNavigate, useSearchParams } from "react-router-dom";

/* ================= HELPERS ================= */
const engineerName = (e) =>
  e?.name || e?.username || e?.email || "Engineer";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loading, setLoading] = useState(false);

  const role = (localStorage.getItem("role") || "").toUpperCase();
  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const customerIdParam = Number(searchParams.get("customerId"));
  const engineerIdParam = Number(searchParams.get("engineerId"));

  /* ================= FETCH TICKETS ================= */
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tickets");
      let data = Array.isArray(res.data) ? res.data : [];
      const now = new Date();

      // 1. Role-based filtering
      if (role === "CUSTOMER") {
        data = data.filter((t) => t.customer?.id === userId);
      } else if (role === "ENGINEER") {
        data = data.filter((t) => t.assignedEngineer?.id === userId);
      }

      // 2. Admin Summary filtering
      if (role === "ADMIN" && customerIdParam) {
        data = data.filter((t) => t.customer?.id === customerIdParam);
      }
      if (engineerIdParam) {
        data = data.filter((t) => t.assignedEngineer?.id === engineerIdParam);
      }

      // 3. SMART STATUS & SLA FILTERING
      if (statusParam) {
        const param = statusParam.toUpperCase();

        if (param === "SLA_ACTIVE") {
          // Clock is running: In Progress and deadline is in the future
          data = data.filter(t => t.status === "IN_PROGRESS" && t.slaDueTime && new Date(t.slaDueTime) > now);
        } 
        else if (param === "SLA_BREACHED") {
          // Explicitly show only tickets that breached
          data = data.filter(t => t.slaBreached === true);
        }
        else if (param === "SLA_MET") {
          // Show tickets finished on time (Resolved/Closed and not breached)
          data = data.filter(t => (t.status === "RESOLVED" || t.status === "CLOSED") && t.slaBreached === false);
        }
        else {
          // Standard status filtering
          data = data.filter((t) => String(t.status).toUpperCase() === param);
        }
      }

      setTickets(data);
      checkFeedback(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [role, userId, statusParam, customerIdParam, engineerIdParam]);

  /* ================= FETCH ENGINEERS ================= */
  const fetchEngineers = async () => {
    try {
      const res = await api.get("/api/tickets");
      const list = Array.isArray(res.data) ? res.data : [];
      const map = {};
      list.forEach((t) => {
        if (t.assignedEngineer) map[t.assignedEngineer.id] = t.assignedEngineer;
      });
      setEngineers(Object.values(map));
    } catch {
      setEngineers([]);
    }
  };

  useEffect(() => {
    fetchTickets();
    if (role === "AGENT" || role === "ADMIN") fetchEngineers();
  }, [fetchTickets, role]);

  /* ================= CHECK FEEDBACK ================= */
  const checkFeedback = async (list) => {
    if (role !== "ADMIN" && role !== "CUSTOMER") return;
    const map = {};
    await Promise.all(
      list
        .filter((t) => String(t.status).toUpperCase() === "RESOLVED")
        .map(async (t) => {
          try {
            await api.get(`/api/feedback/ticket/${t.id}`);
            map[t.id] = true;
          } catch {
            map[t.id] = false;
          }
        })
    );
    setFeedbackMap(map);
  };

  /* ================= SLA RENDER ================= */
  const renderSla = (t) => {
    if (!t.slaDueTime) return "-";
    const status = String(t.status).toUpperCase();
    const now = new Date();
    const due = new Date(t.slaDueTime);

    if (status === "OPEN") return "-";
    if (status === "IN_PROGRESS") {
      if (now < due) {
        const hrs = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        return <span style={{ color: "#22c55e", fontWeight: 600 }}>⏳ {hrs.toFixed(1)} h</span>;
      }
      return <span style={{ color: "#ef4444", fontWeight: 600 }}>Breached ❌</span>;
    }
    return t.slaBreached ? 
      <span style={{ color: "#ef4444", fontWeight: 600 }}>Breached ❌</span> : 
      <span style={{ color: "#22c55e", fontWeight: 600 }}>Met ✅</span>;
  };

  const closeTicket = async (ticketId) => {
    try {
      await api.put(`/api/tickets/${ticketId}/status`, { status: "CLOSED", performedByUserId: userId });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Error closing ticket");
    }
  };

  return (
    <div className="dark-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Ticket List 🎫 {statusParam ? `- ${statusParam.replace('_', ' ')}` : ''}</h2>
        {statusParam && <button className="btn-small" onClick={() => navigate("/tickets")}>Clear Filters</button>}
      </div>

      {loading ? <p>Loading tickets...</p> : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Description</th>
              <th>Status</th>
              {(role === "ADMIN" || role === "AGENT") && <th>Customer</th>}
              {role !== "CUSTOMER" && (
                <>
                  <th>Engineer</th>
                  <th>Priority</th>
                  <th>Severity</th>
                </>
              )}
              {role === "ADMIN" && <th>SLA</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No tickets found.</td></tr>
            ) : (
              tickets.map((t, index) => {
                const status = String(t.status).toUpperCase();
                const allowAgentEdit = role === "AGENT" && (status === "OPEN" || status === "IN_PROGRESS");
                return (
                  <tr key={t.id}>
                    <td>{index + 1}</td>
                    {/* ✅ FIXED: Prioritizing Business ID T-001 over Numeric ID */}
                    <td>{t.ticketId || t.id}</td> 
                    <td>{t.description}</td>
                    <td>
                      <span className="status">
                        <span className={`status-dot status-${status}`}></span>
                        {status}
                      </span>
                    </td>
                    {(role === "ADMIN" || role === "AGENT") && (
                      <td>{t.customer?.name || t.customer?.email || "-"}</td>
                    )}
                    {role !== "CUSTOMER" && (
                      <>
                        <td>
                          {t.assignedEngineer ? engineerName(t.assignedEngineer) : allowAgentEdit ? (
                            <select onChange={async (e) => {
                                const engId = Number(e.target.value);
                                if (!engId) return;
                                await api.put(`/api/tickets/${t.id}/assign`, { engineerId: engId, performedBy: userId });
                                fetchTickets();
                              }}>
                              <option value="">Assign Engineer</option>
                              {engineers.map((e) => <option key={e.id} value={e.id}>{engineerName(e)}</option>)}
                            </select>
                          ) : "Unassigned"}
                        </td>
                        <td>
                          {t.priority || (allowAgentEdit ? (
                            <select onChange={async (e) => {
                                await api.put(`/api/tickets/${t.id}/priority-severity`, { priority: e.target.value, performedByUserId: userId });
                                fetchTickets();
                              }}>
                              <option value="">Set Priority</option>
                              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                            </select>
                          ) : "-")}
                        </td>
                        <td>
                          {t.severity || (allowAgentEdit ? (
                            <select onChange={async (e) => {
                                await api.put(`/api/tickets/${t.id}/priority-severity`, { severity: e.target.value, performedByUserId: userId });
                                fetchTickets();
                              }}>
                              <option value="">Set Severity</option>
                              <option value="MINOR">Minor</option><option value="MAJOR">Major</option><option value="CRITICAL">Critical</option>
                            </select>
                          ) : "-")}
                        </td>
                      </>
                    )}
                    {role === "ADMIN" && <td>{renderSla(t)}</td>}
                    <td>
                      <button onClick={() => navigate(`/tickets/${t.id}/history`)}>History</button>
                      {role === "ADMIN" && (status === "RESOLVED" || status === "CLOSED") && (
                        <button onClick={() => navigate(`/tickets/${t.id}/view-feedback`)}>View Feedback</button>
                      )}
                      {role === "CUSTOMER" && status === "RESOLVED" && !feedbackMap[t.id] && (
                        <button onClick={() => navigate(`/tickets/${t.id}/feedback`)}>Give Feedback</button>
                      )}
                      {role === "ADMIN" && status === "RESOLVED" && (
                        <button disabled={!feedbackMap[t.id]} onClick={() => closeTicket(t.id)}>Close</button>
                      )}
                      {role === "ENGINEER" && status === "IN_PROGRESS" && (
                        <button onClick={async () => {
                            await api.put(`/api/tickets/${t.id}/status`, { status: "RESOLVED", performedByUserId: userId });
                            fetchTickets();
                          }}>Resolve</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}