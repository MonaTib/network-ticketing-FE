import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";

export default function Feedback() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitFeedback = async (e) => {
    e.preventDefault();

    if (!rating) {
      alert("Please select a rating");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/feedback/submit", {
        ticketId: Number(ticketId),
      customerId: 6,        // 🔴 TEMP: logged-in customer (Ayush = 6)
      rating: Number(rating),
      comment: comment
      });

      alert("Feedback submitted successfully");

      // Redirect back to tickets
      navigate("/tickets",{replace:true});

    }catch (err) {
  console.error(err.response?.data || err.message);
  alert(
    err.response?.data?.message ||
    "Failed to submit feedback"
  );
}
   finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        background: "#fff",
        padding: "20px",
        borderRadius: "8px"
      }}
    >
      <h2>Give Feedback ⭐</h2>
      <p><strong>Ticket ID:</strong> {ticketId}</p>

      <form onSubmit={submitFeedback}>
        {/* RATING */}
        <label>Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        >
          <option value="">Select Rating</option>
          <option value="1">1 - Very Bad</option>
          <option value="2">2 - Bad</option>
          <option value="3">3 - Average</option>
          <option value="4">4 - Good</option>
          <option value="5">5 - Excellent</option>
        </select>

        {/* COMMENT */}
        <label>Comment</label>
        <textarea
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your feedback here..."
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
