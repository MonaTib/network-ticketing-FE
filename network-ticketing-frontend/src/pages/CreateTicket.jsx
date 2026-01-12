import { useState } from "react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function CreateTicket() {
  const [description, setDescription] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  // 🔒 CUSTOMER ONLY
  if (role !== "CUSTOMER") {
    return <p>You are not authorized to create tickets.</p>;
  }

  const submitTicket = async () => {
    if (!description || !issueCategory) {
      alert("Fill all fields");
      return;
    }

    try {
      await api.post("/api/tickets/create", {
        customerId: Number(userId),
        description,
        issueCategory
      });

      alert("Ticket created successfully");
      navigate("/tickets");
    } catch (err) {
      alert("Failed to create ticket");
    }
  };

  return (
    <div className="dark-card create-ticket" style={{ maxWidth: "600px" }}>
      <h2>Create Ticket 🎫</h2>

      {/* DESCRIPTION */}
      <label>Description</label>
      <textarea
        className="textarea-large"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your issue in detail..."
      />

      {/* ISSUE CATEGORY */}
      <label>Issue Category</label>
      <select
        className="input-large"
        value={issueCategory}
        onChange={(e) => setIssueCategory(e.target.value)}
      >
        <option value="">Select</option>
        <option value="Hardware">Hardware</option>
        <option value="Software">Software</option>
        <option value="Network">Network</option>
        <option value="Billing">Billing</option>
        <option value="Account">Account</option>
      </select>

      <button onClick={submitTicket}>
        Create Ticket
      </button>
    </div>
  );
}
