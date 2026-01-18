import { useEffect, useState, useCallback } from "react";
import api from "../utils/axios";
import { useNavigate, useSearchParams } from "react-router-dom";

// Standardized helper for displaying engineer identity
const engineerName = (e) => e?.name || e?.username || e?.email || "Engineer";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [selections, setSelections] = useState({});

  const role = (localStorage.getItem("role") || "").toUpperCase();
  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const customerIdParam = Number(searchParams.get("customerId"));
  const engineerIdParam = Number(searchParams.get("engineerId"));

  const hideCustomerColumn = !!customerIdParam || role === "CUSTOMER";

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tickets");
      let data = Array.isArray(res.data) ? res.data : [];
      const now = new Date();

      if (role === "CUSTOMER") data = data.filter(t => t.customer?.id === userId);
      else if (role === "ENGINEER") data = data.filter(t => t.assignedEngineer?.id === userId);
      else if (role === "ADMIN" && customerIdParam) data = data.filter(t => t.customer?.id === customerIdParam);
      
      if (role === "ADMIN" && engineerIdParam) {
        data = data.filter(t => t.assignedEngineer?.id === engineerIdParam);
      }

      if (statusParam) {
        const p = statusParam.toUpperCase();
        if (p === "SLA_ACTIVE") data = data.filter(t => t.status === "IN_PROGRESS" && t.slaDueTime && new Date(t.slaDueTime) > now);
        else if (p === "SLA_BREACHED") data = data.filter(t => t.slaBreached);
        else if (p === "SLA_MET") data = data.filter(t => (t.status === "RESOLVED" || t.status === "CLOSED") && !t.slaBreached);
        else data = data.filter(t => String(t.status).toUpperCase() === p);
      }
      setTickets(data);
      checkFeedback(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [role, userId, statusParam, customerIdParam, engineerIdParam]);

  const fetchEngineers = async () => {
    try {
      const res = await api.get("/api/users/engineers"); 
      setEngineers(Array.isArray(res.data) ? res.data : []);
    } catch {
      const res = await api.get("/api/tickets");
      const list = Array.isArray(res.data) ? res.data : [];
      const map = {};
      list.forEach(t => { if (t.assignedEngineer) map[t.assignedEngineer.id] = t.assignedEngineer; });
      setEngineers(Object.values(map));
    }
  };

  const checkFeedback = async (list) => {
    if (role !== "ADMIN" && role !== "CUSTOMER") return;
    const map = {};
    await Promise.all(list.filter(t => String(t.status).toUpperCase() === "RESOLVED").map(async (t) => {
      try {
        await api.get(`/api/feedback/ticket/${t.id}`);
        map[t.id] = true;
      } catch { map[t.id] = false; }
    }));
    setFeedbackMap(map);
  };

  const handleAutoAssign = async (ticketId, field, value) => {
  const prev = selections[ticketId] || {
    engineerId: "",
    priority: "",
    severity: ""
  };

  const current = {
    ...prev,
    [field]: value
  };

  // ✅ update UI state
  setSelections(prevSel => ({
    ...prevSel,
    [ticketId]: current
  }));

  // ✅ USE `current`, NOT `selections`
  if (current.engineerId && current.priority && current.severity) {
    try {
      await api.put(`/api/tickets/${ticketId}/assign`, {
        engineerId: Number(current.engineerId),
        priority: current.priority,
        severity: current.severity,
        performedBy: userId
      });

      // optimistic update
      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, status: "IN_PROGRESS" } : t
        )
      );

      // clear local selection
      setSelections(prevSel => {
        const copy = { ...prevSel };
        delete copy[ticketId];
        return copy;
      });

      fetchTickets();
    } catch {
      alert("Assignment failed");
    }
  }
};


  useEffect(() => {
    fetchTickets();
    if (role === "AGENT" || role === "ADMIN") fetchEngineers();
  }, [fetchTickets, role]);

  const closeTicket = async (ticketId) => {
    try {
      await api.put(`/api/tickets/${ticketId}/status`, { status: "CLOSED", performedByUserId: userId });
      fetchTickets();
    } catch (err) { alert("Error closing ticket"); }
  };

  const renderSla = (t) => {
    const s = String(t.status).toUpperCase();
    if (s === "RESOLVED" || s === "CLOSED") {
      return t.slaBreached ? <span className="sla-badge badge-breached">Breached ❌</span> : <span className="sla-badge badge-met">Met ✅</span>;
    }
    if (!t.slaDueTime) return "-";
    const now = new Date();
    const due = new Date(t.slaDueTime);
    if (s === "IN_PROGRESS") {
      if (now < due) return <span className="sla-badge badge-active">⏳ {((due - now) / (1000 * 60 * 60)).toFixed(1)} h</span>;
      return <span className="sla-badge badge-breached">Breached ❌</span>;
    }
    return "-";
  };

  return (
    <div className="dark-card">
      <h2>{engineerIdParam ? "Filtered Engineer Tickets 🎫" : "Ticket List 🎫"}</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th style={{ padding: '0 15px' }}>ID</th>
            <th>Description</th>
            <th>Status</th>
            {!hideCustomerColumn && <th>Customer</th>}
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
          {tickets.map((t, index) => {
            const status = String(t.status).toUpperCase();
            const currentSelection = selections[t.id] || {};

            return (
              <tr key={t.id}>
                <td>{index + 1}</td>
                <td style={{ padding: '0 15px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t.ticketId ? t.ticketId : `T-${String(t.id).padStart(3, '0')}`}
</td>
                <td>{t.description}</td>
                <td>
                  <span className={`status status-${status}`}>
                    <span className="status-dot"></span> {status}
                  </span>
                </td>
                {!hideCustomerColumn && <td>{t.customer?.name}</td>}
                
                {role === "AGENT" && status === "OPEN" ? (
                  <>
                    <td>
                      <select 
                        className="form-input-sm" 
                        onChange={(e) => handleAutoAssign(t.id, 'engineerId', e.target.value)}
                        value={currentSelection.engineerId || ""}
                      >
                        <option value="">Select Engineer</option>
                        {engineers.map(eng => (
                          <option key={eng.id} value={eng.id}>{eng.name || eng.username}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select 
                        className="form-input-sm" 
                        onChange={(e) => handleAutoAssign(t.id, 'priority', e.target.value)}
                        value={currentSelection.priority || ""}
                      >
                        <option value="">Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        className="form-input-sm" 
                        onChange={(e) => handleAutoAssign(t.id, 'severity', e.target.value)}
                        value={currentSelection.severity || ""}
                      >
                        <option value="">Severity</option>
                        <option value="MINOR">Minor</option>
                        <option value="MAJOR">Major</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </td>
                  </>
                ) : (
                  role !== "CUSTOMER" && (
                    <>
                      <td>{engineerName(t.assignedEngineer)}</td>
                      <td>{t.priority || "-"}</td>
                      <td>{t.severity || "-"}</td>
                    </>
                  )
                )}

                {role === "ADMIN" && <td>{renderSla(t)}</td>}
                <td>
                  <div className="action-container">
                    <button className="btn-action" onClick={() => navigate(`/tickets/${t.id}/history`)}>History</button>
                    {role === "ENGINEER" && status === "IN_PROGRESS" && (
                      <button className="btn-action btn-resolve" onClick={async () => {
                        await api.put(`/api/tickets/${t.id}/status`, { status: "RESOLVED", performedByUserId: userId });
                        fetchTickets();
                      }}>Resolve</button>
                    )}
                    {role === "ADMIN" && (status === "RESOLVED" || status === "CLOSED") && (
                      <button className="btn-action" onClick={() => navigate(`/tickets/${t.id}/view-feedback`)}>View Feedback</button>
                    )}
                    {role === "ADMIN" && status === "RESOLVED" && (
                      <button className="btn-action" disabled={!feedbackMap[t.id]} onClick={() => closeTicket(t.id)}>Close</button>
                    )}
                    {role === "CUSTOMER" && status === "RESOLVED" && !feedbackMap[t.id] && (
                      <button className="btn-action" onClick={() => navigate(`/tickets/${t.id}/feedback`)}>Give Feedback</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}