import { useEffect, useMemo, useState } from "react";
import DocumentUpload from "./DocumentUpload";
import DocumentList from "./DocumentList";
import DashboardSummary from "./DashboardSummary";

import {
  getEmployeeBalances,
  getEmployeeLeaveHistory,
  cancelLeave,
} from "../services/api";

import ApplyLeave from "./ApplyLeave";

const STATUS_META = {
  PENDING: { label: "Pending", className: "status-badge--pending" },
  APPROVED: { label: "Approved", className: "status-badge--approved" },
  REJECTED: { label: "Rejected", className: "status-badge--rejected" },
  CANCELLED: { label: "Cancelled", className: "status-badge--cancelled" },
};

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

function EmployeeDashboard({ token }) {
  const [employeeId, setEmployeeId] = useState(1);

  const [balances, setBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const balanceData = await getEmployeeBalances(employeeId, token);
      const leaveData = await getEmployeeLeaveHistory(employeeId, token);

      setBalances(balanceData);
      setLeaves(leaveData);
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
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  async function handleCancel(leaveId) {
    try {
      const data = await cancelLeave(leaveId, token);
      setIsError(false);
      setMessage(data.message);
      await loadDashboard();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  }

  // Leave history only carries a leave_type_id — reuse the names we
  // already fetched with the balances instead of showing a raw number.
  const leaveTypeNames = useMemo(() => {
    const map = {};
    balances.forEach((balance) => {
      map[balance.leave_type_id ?? balance.id] = balance.leave_type_name;
    });
    return map;
  }, [balances]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <DashboardSummary token={token} />

        <div className="employee-switcher">
          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            type="number"
            min="1"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
          />
        </div>
      </div>

      {message && (
        <div
          className={`message ${isError ? "message--error" : ""}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </div>
      )}

      <section className="section">
        <h2>Leave Balance</h2>

        {loading ? (
          <div className="balance-grid">
            {[1, 2, 3].map((i) => (
              <div className="balance-card skeleton" key={i} />
            ))}
          </div>
        ) : balances.length === 0 ? (
          <p className="empty-state">No leave balances to show yet.</p>
        ) : (
          <div className="balance-grid">
            {balances.map((balance) => (
              <div className="balance-card" key={balance.id}>
                <h3>{balance.leave_type_name}</h3>
                <p className="balance-value">{balance.remaining_days}</p>
                <p className="balance-caption">days remaining</p>
                <p className="balance-meta">
                  {balance.used_days} used of {balance.total_days}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <ApplyLeave
          employeeId={employeeId}
          token={token}
          onLeaveCreated={loadDashboard}
        />
      </section>

      <section className="section">
        <DocumentUpload employeeId={employeeId} token={token} />
      </section>

      <section className="section">
        <DocumentList employeeId={employeeId} token={token} />
      </section>

      <div className="card">
        <h2>Leave History</h2>

        {leaves.length === 0 ? (
          <p className="empty-state">No leave requests found.</p>
        ) : (
          leaves.map((leave) => {
            const status = STATUS_META[leave.status] ?? {
              label: leave.status,
              className: "",
            };

            return (
              <div className="leave-card" key={leave.id}>
                <div className="leave-card__head">
                  <h3>Leave Request #{leave.id}</h3>
                  <span className={`status-badge ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="leave-meta">
                  <span>
                    {leaveTypeNames[leave.leave_type_id] ||
                      `Type #${leave.leave_type_id}`}
                  </span>
                  <span className="leave-meta__dates">
                    {formatDate(leave.from_date)} – {formatDate(leave.to_date)}
                  </span>
                </div>

                <p className="leave-reason">
                  {leave.reason || "No reason provided"}
                </p>

                {leave.manager_comment && (
                  <div className="leave-note">
                    <span className="leave-note__label">
                      Manager comment
                    </span>
                    <p>{leave.manager_comment}</p>
                  </div>
                )}

                {leave.status === "PENDING" && (
                  <button
                    className="cancel-button"
                    onClick={() => handleCancel(leave.id)}
                  >
                    Cancel leave
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
