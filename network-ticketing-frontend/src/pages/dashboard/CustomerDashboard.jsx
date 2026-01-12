import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerSummary();
    // eslint-disable-next-line
  }, []);

  const fetchCustomerSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tickets");
      const tickets = Array.isArray(res.data) ? res.data : [];

      const myTickets = tickets.filter(
        t => t.customer?.id === userId
      );

      setCounts({
        TOTAL: myTickets.length,
        OPEN: myTickets.filter(t => t.status === "OPEN").length,
        IN_PROGRESS: myTickets.filter(t => t.status === "IN_PROGRESS").length,
        RESOLVED: myTickets.filter(t => t.status === "RESOLVED").length,
        CLOSED: myTickets.filter(t => t.status === "CLOSED").length
      });
    } catch {
      alert("Failed to load customer dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !counts) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dark-card">
      <h2>Customer Dashboard</h2>

      <div className="dashboard-cards" style={{ marginTop: 20 }}>
        <div
          className="dashboard-card card-total"
          onClick={() => navigate("/tickets")}
        >
          <h4>Total Tickets</h4>
          <p>{counts.TOTAL}</p>
        </div>

        <div
          className="dashboard-card card-open"
          onClick={() => navigate("/tickets?status=OPEN")}
        >
          <h4>Open</h4>
          <p>{counts.OPEN}</p>
        </div>

        <div
          className="dashboard-card card-progress"
          onClick={() => navigate("/tickets?status=IN_PROGRESS")}
        >
          <h4>In Progress</h4>
          <p>{counts.IN_PROGRESS}</p>
        </div>

        <div
          className="dashboard-card card-resolved"
          onClick={() => navigate("/tickets?status=RESOLVED")}
        >
          <h4>Resolved</h4>
          <p>{counts.RESOLVED}</p>
        </div>

        <div
          className="dashboard-card card-closed"
          onClick={() => navigate("/tickets?status=CLOSED")}
        >
          <h4>Closed</h4>
          <p>{counts.CLOSED}</p>
        </div>
      </div>
    </div>
  );
}
