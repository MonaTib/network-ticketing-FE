import { useEffect, useState } from "react";
import api from "../utils/axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function CustomerSummary() {
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔒 ADMIN ONLY
  if (role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tickets");
      const tickets = Array.isArray(res.data) ? res.data : [];

      const map = {};

      tickets.forEach(t => {
        if (!t.customer) return;
        const id = t.customer.id;
        const name = t.customer.name;

        if (!map[id]) {
          map[id] = {
            id,
            name,
            total: 0,
            open: 0,
            resolved: 0,
            breached: 0
          };
        }

        map[id].total++;

        if (t.status === "OPEN") map[id].open++;
        if (t.status === "RESOLVED" || t.status === "CLOSED")
          map[id].resolved++;
        if (t.slaBreached) map[id].breached++;
      });

      setSummary(Object.values(map));
    } catch {
      alert("Failed to load customer summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-page dark-card">
      <h2>👥 Customer Summary</h2>

      {loading ? (
        <p>Loading...</p>
      ) : summary.length === 0 ? (
        <p>No data available</p>
      ) : (
        <div className="summary-card">
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                {/* ✅ Added Customer Name column */}
                <th style={{ padding: '0 15px', textAlign: 'left' }}>Customer</th>
                <th>Total Tickets</th>
                <th>Open</th>
                <th>Resolved</th>
                <th>SLA Breached</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {summary.map(c => (
                <tr key={c.id}>
                  {/* ✅ Restored the Customer Name data */}
                  <td style={{ padding: '0 15px', fontWeight: 'bold' }}>{c.name}</td>
                  <td>{c.total}</td>
                  <td>{c.open}</td>
                  <td>{c.resolved}</td>
                  <td style={{ 
                    color: c.breached > 0 ? '#ef4444' : 'inherit', 
                    fontWeight: c.breached > 0 ? '600' : 'normal' 
                  }}>
                    {c.breached}
                  </td>
                  <td>
                    <button
                      className="btn-action"
                      onClick={() =>
                        navigate(`/tickets?customerId=${c.id}`)
                      }
                    >
                      View Tickets
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}