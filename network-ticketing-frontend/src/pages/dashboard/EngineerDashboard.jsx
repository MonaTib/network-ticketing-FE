import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function EngineerDashboard() {
  const [counts, setCounts] = useState(null);
  const navigate = useNavigate();

  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await api.get("/api/tickets");
      const all = Array.isArray(res.data) ? res.data : [];

      const myTickets = all.filter(
        t => t.assignedEngineer?.id === userId
      );

      setCounts({
        IN_PROGRESS: myTickets.filter(t => t.status === "IN_PROGRESS").length,
        RESOLVED: myTickets.filter(t => t.status === "RESOLVED").length,
        CLOSED: myTickets.filter(t => t.status === "CLOSED").length
      });
    } catch {
      alert("Failed to load engineer dashboard");
    }
  };

  if (!counts) return <p>Loading dashboard...</p>;

  return (
    <div className="dark-card">
      <h2>Engineer Dashboard 🛠️</h2>

      <div className="dashboard-cards" style={{ marginTop: 20 }}>
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
