import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";

export default function TicketHistory() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const role = (localStorage.getItem("role") || "").toUpperCase();

  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketRes, historyRes] = await Promise.all([
        api.get(`/api/tickets/${ticketId}`),
        api.get(`/api/tickets/${ticketId}/history`)
      ]);

      setTicket(ticketRes.data);

      let historyData = Array.isArray(historyRes.data)
        ? historyRes.data
        : [];

      // ✅ ENGINEER: ONLY ENGINEER_ASSIGNED EVENT
      if (role === "ENGINEER") {
        historyData = historyData.filter(
          h => h.action === "ENGINEER_ASSIGNED"
        );
      }

      setHistory(historyData);
    } catch {
      alert("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!ticket) return null;

  return (
    <div className="dark-card">
      <h2>Ticket Details 📄</h2>

      <button onClick={() => navigate("/tickets")}>← Back</button>

      {/* BASIC DETAILS */}
      <table style={{ marginTop: 15 }}>
        <tbody>
          <tr>
            <td><b>Ticket ID</b></td>
            <td>{ticket.id}</td>
          </tr>
          <tr>
            <td><b>Description</b></td>
            <td>{ticket.description}</td>
          </tr>
          <tr>
            <td><b>Status</b></td>
            <td>{ticket.status}</td>
          </tr>
          <tr>
            <td><b>Created At</b></td>
            <td>{new Date(ticket.createdAt).toLocaleString()}</td>
          </tr>

          {/* ENGINEER ASSIGNED TIME */}
          {role === "ENGINEER" && history.length > 0 && (
            <tr>
              <td><b>Assigned At</b></td>
              <td>
                {new Date(history[0].actionTime).toLocaleString()}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
