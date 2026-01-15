import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role")?.toUpperCase();

  const isActive = (path) => location.pathname === path ? "nav-btn active" : "nav-btn";

  return (
    <nav className="enterprise-navbar">
      <div className="nav-container">
        <div className="nav-brand">SupportPortal ⚡</div>
        
        <div className="nav-group">
          {/* Dashboard always first */}
          <button onClick={() => navigate('/dashboard')} className={isActive('/dashboard')}>
            Dashboard
          </button>


           {role === "CUSTOMER" && (
            <button onClick={() => navigate('/create-ticket')} className={isActive('/create-ticket')}>
              Create Ticket
            </button>
          )}

          {/* Tickets second */}
          <button onClick={() => navigate('/tickets')} className={isActive('/tickets')}>
            Tickets
          </button>

         

          {/* Admin Specific Links */}
          {role === "ADMIN" && (
            <>
              <button onClick={() => navigate('/admin/customers')} className={isActive('/admin/customers')}>
                Customers
              </button>
              <button onClick={() => navigate('/admin/engineers')} className={isActive('/admin/engineers')}>
                Engineers
              </button>
            </>
          )}
        </div>

        <button className="logout-pill" onClick={() => { localStorage.clear(); navigate('/'); }}>
          Logout
        </button>
      </div>
    </nav>
  );
}