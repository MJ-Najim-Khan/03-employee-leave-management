import { useEffect, useState } from "react";
import DashboardSummary from "./DashboardSummary";
import {
  getLeaves,
  approveLeave,
  rejectLeave,
} from "../services/api";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ManagerDashboard({ token }) {
  const [leaves, setLeaves] = useState([]);
  const [comments, setComments] = useState({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadLeaves() {
    try {
      setLoading(true);

      const data = await getLeaves(token);

      setLeaves(data);
      setMessage("");
      setIsError(false);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  function updateComment(leaveId, value) {
    setComments((current) => ({
      ...current,
      [leaveId]: value,
    }));
  }

  async function handleApprove(leaveId) {
    try {
      const comment = comments[leaveId] || "";
      const data = await approveLeave(leaveId, comment, token);
      setIsError(false);
      setMessage(data.message);
      await loadLeaves();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  }

  async function handleReject(leaveId) {
    try {
      const comment = comments[leaveId] || "";
      const data = await rejectLeave(leaveId, comment, token);
      setIsError(false);
      setMessage(data.message);
      await loadLeaves();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  }

  const pendingLeaves = leaves.filter((leave) => leave.status === "PENDING");

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>
          <DashboardSummary token={token} />
          <p className="dashboard-subtitle">
            Review and manage pending employee leave requests.
          </p>
        </div>

        {!loading && (
          <span className="count-pill">{pendingLeaves.length} pending</span>
        )}
      </div>

      {message && (
        <div
          className={`message ${isError ? "message--error" : ""}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </div>
      )}

      {loading ? (
        <>
          <div className="leave-card skeleton-leave" />
          <div className="leave-card skeleton-leave" />
        </>
      ) : pendingLeaves.length === 0 ? (
        <div className="card empty-card">
          <span className="empty-check" aria-hidden="true">
            ✓
          </span>
          <h3>All caught up</h3>
          <p>There are no pending leave requests right now.</p>
        </div>
      ) : (
        pendingLeaves.map((leave) => (
          <div className="leave-card" key={leave.id}>
            <div className="leave-card__head">
              <h3>Leave Request #{leave.id}</h3>
              <span className="leave-meta__dates">
                {formatDate(leave.from_date)} – {formatDate(leave.to_date)}
              </span>
            </div>

            <div className="leave-meta">
              <span>Employee #{leave.employee_id}</span>
              <span>Type #{leave.leave_type_id}</span>
            </div>

            <p className="leave-reason">
              {leave.reason || "No reason provided"}
            </p>

            <div className="review-controls">
              <label htmlFor={`comment-${leave.id}`}>Comment (optional)</label>
              <textarea
                id={`comment-${leave.id}`}
                placeholder="Add a note for the employee"
                value={comments[leave.id] || ""}
                onChange={(event) =>
                  updateComment(leave.id, event.target.value)
                }
              />

              <div className="action-buttons">
                <button onClick={() => handleApprove(leave.id)}>
                  Approve
                </button>

                <button
                  className="reject-button reject-button--ghost"
                  onClick={() => handleReject(leave.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ManagerDashboard;
