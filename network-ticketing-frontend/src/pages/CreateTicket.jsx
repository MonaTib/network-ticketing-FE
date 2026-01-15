import { useState } from "react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function CreateTicket() {
  const [description, setDescription] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // New: Tracks API request status

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  if (role !== "CUSTOMER") {
    return <p style={{ color: "white", padding: "20px" }}>You are not authorized to create tickets.</p>;
  }

  const submitTicket = async (e) => {
    e.preventDefault(); 
    
    // Validation
    let validationErrors = {};
    if (!description.trim()) validationErrors.description = "Description is required";
    if (!issueCategory) validationErrors.issueCategory = "Please select a category";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true); // Start loading state

    try {
      await api.post("/api/tickets/create", {
        customerId: Number(userId),
        description,
        issueCategory
      });
      setShowModal(true);
    } catch (err) {
      alert("Failed to create ticket");
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <h2>Create New Ticket 🎫</h2>
        <p>Please provide detailed information about your technical issue.</p>
      </div>

      <div className="dark-card form-card">
        <form onSubmit={submitTicket} className="create-ticket-form">
          <div className="form-group">
            <label>Issue Category</label>
            <select
              className={`form-input ${errors.issueCategory ? 'input-error' : ''}`}
              value={issueCategory}
              disabled={loading} // Disable during loading
              onChange={(e) => {
                setIssueCategory(e.target.value);
                setErrors({ ...errors, issueCategory: "" });
              }}
            >
              <option value="" disabled hidden>-- Select Category --</option>
              <option value="Hardware">Hardware Issue</option>
              <option value="Software">Software Installation/Issue</option>
              <option value="Network">Network/VPN Connectivity</option>
              <option value="Billing">Billing & Payment</option>
              <option value="Account">Account Access</option>
            </select>
            {errors.issueCategory && <span className="error-text">{errors.issueCategory}</span>}
          </div>

          <div className="form-group">
            <label>Detailed Description</label>
            <textarea
              className={`form-input textarea-input ${errors.description ? 'input-error' : ''}`}
              value={description}
              disabled={loading} // Disable during loading
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: "" });
              }}
              placeholder="Describe your issue in detail..."
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              disabled={loading}
              onClick={() => navigate('/tickets')}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="loader-container">
                  <div className="spinner"></div> Submitting...
                </span>
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="dark-card success-modal">
            <div className="modal-icon">✅</div>
            <h3>Ticket Created!</h3>
            <p>Your ticket has been submitted successfully.</p>
            <button className="btn-primary" onClick={() => navigate("/tickets")}>
              View My Tickets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}