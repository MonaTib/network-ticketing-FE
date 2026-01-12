import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";

export default function ViewFeedback() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noFeedback, setNoFeedback] = useState(false);

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await api.get(`/api/feedback/ticket/${ticketId}`);
      setFeedback(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNoFeedback(true); // ✅ IMPORTANT
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Loading
  if (loading) {
    return <p>Loading feedback...</p>;
  }

  // ❌ Feedback not given (ADMIN SHOULD SEE MESSAGE, NOT BLANK PAGE)
  if (noFeedback) {
    return (
      <div className="dark-card">
        <h3>Feedback Not Submitted</h3>
        <p>The customer has not submitted feedback for this ticket.</p>
        <button onClick={() => navigate("/tickets")}>
          ← Back to Tickets
        </button>
      </div>
    );
  }

  // 🛑 Absolute safety (prevents blank screen)
  if (!feedback) {
    return (
      <div className="dark-card">
        <p>Customer has not yet given the Feedback.</p>
        <button onClick={() => navigate("/tickets")}>← Back</button>
      </div>
    );
  }

  // ✅ Feedback exists
  return (
    <div className="dark-card">
      <h2>Customer Feedback</h2>

      <p><b>Rating:</b> {feedback.rating}</p>
      <p>
        <b>Comment:</b>{" "}
        {feedback.comment?.trim() ? feedback.comment : "No comments provided"}
      </p>

      <button onClick={() => navigate("/tickets")}>
        ← Back
      </button>
    </div>
  );
}
