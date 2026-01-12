import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchTickets();
    if (role === "AGENT") fetchEngineers();
    // eslint-disable-next-line
  }, [statusParam, customerIdParam, engineerIdParam]);

  /* ================= FETCH ENGINEERS ================= */
  const fetchEngineers = async () => {
    try {
      const res = await api.get("/api/tickets");
      const list = Array.isArray(res.data) ? res.data : [];

      const map = {};
      list.forEach(t => {
        if (t.assignedEngineer) {
          map[t.assignedEngineer.id] = t.assignedEngineer;
        }
      });

      setEngineers(Object.values(map));
    } catch {
      setEngineers([]);
    }
  };

  /* ================= FETCH TICKETS ================= */
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tickets");
      let data = Array.isArray(res.data) ? res.data : [];

      if (role === "CUSTOMER") {
        data = data.filter(t => t.customer?.id === userId);
      }

      if (role === "ENGINEER") {
        data = data.filter(t => t.assignedEngineer?.id === userId);
      }

      if (role === "ADMIN" && customerIdParam) {
        data = data.filter(t => t.customer?.id === customerIdParam);
      }

      if (engineerIdParam) {
        data = data.filter(t => t.assignedEngineer?.id === engineerIdParam);
      }

      if (statusParam) {
        data = data.filter(
          t => String(t.status).toUpperCase() === statusParam
        );
      }

      setTickets(data);
      checkFeedback(data);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHECK FEEDBACK ================= */
  const checkFeedback = async (list) => {
    if (role !== "ADMIN" && role !== "CUSTOMER") return;

    const map = {};
    await Promise.all(
      list
        .filter(t => String(t.status).toUpperCase() === "RESOLVED")
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

    const now = new Date();
    const due = new Date(t.slaDueTime);

    if (now < due) {
      const hrs = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      return (
        <span style={{ color: "#22c55e", fontWeight: 600 }}>
          ⏳ {hrs.toFixed(1)} h
        </span>
      );
    }

    return (
      <span style={{ color: "#f0e3e3ff", fontWeight: 600 }}>
        Breached ❌
      </span>
    );
  };

  /* ================= ADMIN CLOSE ================= */
  const closeTicket = async (ticketId) => {
    try {
      await api.put(`/api/tickets/${ticketId}/status`, {
        status: "CLOSED",
        performedByUserId: userId
      });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Feedback required");
    }
  };

  return (
    <div className="dark-card">
      <h2>Ticket List 🎫</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
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
            {tickets.map((t, index) => {
              const status = String(t.status).toUpperCase();
              const allowAgentEdit =
                role === "AGENT" &&
                (status === "OPEN" || status === "IN_PROGRESS");

              return (
                <tr key={t.id}>
                  <td>{index + 1}</td>
                  <td>{t.id}</td>
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
                        {t.assignedEngineer ? (
                          engineerName(t.assignedEngineer)
                        ) : allowAgentEdit ? (
                          <select
                            onChange={(e) =>
                              api
                                .put(`/api/tickets/${t.id}/assign`, {
                                  engineerId: Number(e.target.value),
                                  performedBy: userId
                                })
                                .then(fetchTickets)
                            }
                          >
                            <option value="">Assign Engineer</option>
                            {engineers.map(e => (
                              <option key={e.id} value={e.id}>
                                {engineerName(e)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          "Unassigned"
                        )}
                      </td>

                      <td>
                        {t.priority ? (
                          t.priority
                        ) : allowAgentEdit ? (
                          <select
                            defaultValue=""
                            onChange={(e) =>
                              api
                                .put(`/api/tickets/${t.id}/priority-severity`, {
                                  priority: e.target.value,
                                  severity: t.severity ?? null,
                                  performedByUserId: userId
                                })
                                .then(fetchTickets)
                            }
                          >
                            <option value="">Set Priority</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        {t.severity ? (
                          t.severity
                        ) : allowAgentEdit ? (
                          <select
                            defaultValue=""
                            onChange={(e) =>
                              api
                                .put(`/api/tickets/${t.id}/priority-severity`, {
                                  priority: t.priority ?? null,
                                  severity: e.target.value,
                                  performedByUserId: userId
                                })
                                .then(fetchTickets)
                            }
                          >
                            <option value="">Set Severity</option>
                            <option value="MINOR">Minor</option>
                            <option value="MAJOR">Major</option>
                            <option value="CRITICAL">Critical</option>
                          </select>
                        ) : (
                          "-"
                        )}
                      </td>
                    </>
                  )}

                  {role === "ADMIN" && <td>{renderSla(t)}</td>}

                  <td>
                    <button onClick={() => navigate(`/tickets/${t.id}/history`)}>
                      History
                    </button>

                    {role === "ADMIN" &&
                      (status === "RESOLVED" || status === "CLOSED") && (
                        <button
                          onClick={() =>
                            navigate(`/tickets/${t.id}/view-feedback`)
                          }
                        >
                          View Feedback
                        </button>
                      )}

                    {role === "CUSTOMER" &&
                      status === "RESOLVED" &&
                      !feedbackMap[t.id] && (
                        <button
                          onClick={() =>
                            navigate(`/tickets/${t.id}/feedback`)
                          }
                        >
                          Give Feedback
                        </button>
                      )}

                    {role === "ADMIN" && status === "RESOLVED" && (
                      <button
                        disabled={!feedbackMap[t.id]}
                        onClick={() => closeTicket(t.id)}
                      >
                        Close
                      </button>
                    )}

                    {role === "ENGINEER" && status === "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          api
                            .put(`/api/tickets/${t.id}/status`, {
                              status: "RESOLVED",
                              performedByUserId: userId
                            })
                            .then(fetchTickets)
                        }
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
