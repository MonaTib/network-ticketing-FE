import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const role = (localStorage.getItem("role") || "")
    .replace("ROLE_", "")
    .trim()
    .toUpperCase();

  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ padding: 10, background: "#eee" }}>
      <Link to="/dashboard">Dashboard</Link> {" | "}

      {role === "CUSTOMER" && (
        <>
          <Link to="/create-ticket">Create Ticket</Link> {" | "}
          <Link to="/tickets">My Tickets</Link> {" | "}
        </>
      )}

      {(role === "ENGINEER" || role === "AGENT" || role === "ADMIN") && (
        <>
          <Link to="/tickets">View Tickets</Link> {" | "}
        </>
      )}


      {role === "ADMIN" && (
  <>
    {" | "}
    <Link to="/admin/customers">Customer Summary</Link>
    {" | "}
    <Link to="/admin/engineers">Engineer Summary</Link>
  </>
)}


      <button onClick={logout}>Logout</button>
    </div>
  );
}
