import { useState } from "react";
import { createLeave } from "../services/api";

// Fallback only — pass a real `leaveTypes` prop (from the leave-types
// endpoint / balances response) so new types created in Admin actually
// show up here instead of being invisible until this file is edited.
const DEFAULT_LEAVE_TYPES = [
  { id: 1, name: "Casual Leave" },
  { id: 2, name: "Sick Leave" },
  { id: 3, name: "Earned Leave" },
];

function getDayCount(from, to) {
  if (!from || !to) return null;
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diff = Math.round((end - start) / 86400000) + 1;
  return diff > 0 ? diff : null;
}

function ApplyLeave({ employeeId, token, onLeaveCreated, leaveTypes }) {
  const options = leaveTypes && leaveTypes.length ? leaveTypes : DEFAULT_LEAVE_TYPES;

  const [leaveTypeId, setLeaveTypeId] = useState(options[0]?.id ?? 1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayCount = getDayCount(fromDate, toDate);

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      const data = await createLeave(
        employeeId,
        leaveTypeId,
        fromDate,
        toDate,
        reason,
        token
      );

      setIsError(false);
      setMessage(`Leave request created. ID: ${data.id}`);

      setFromDate("");
      setToDate("");
      setReason("");

      onLeaveCreated();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2>Apply Leave</h2>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="leaveType">Leave Type</label>
          <select
            id="leaveType"
            value={leaveTypeId}
            onChange={(event) => setLeaveTypeId(event.target.value)}
          >
            {options.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="date-range">
          <div className="field">
            <label htmlFor="fromDate">From Date</label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="toDate">To Date</label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => setToDate(event.target.value)}
              required
            />
          </div>
        </div>

        {dayCount && (
          <p className="day-count-chip">
            {dayCount} {dayCount === 1 ? "day" : "days"} requested
          </p>
        )}

        <div className="field">
          <label htmlFor="reason">Reason (optional)</label>
          <textarea
            id="reason"
            placeholder="Reason for leave"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting && <span className="spinner" aria-hidden="true" />}
          {isSubmitting ? "Applying…" : "Apply Leave"}
        </button>
      </form>

      {message && (
        <p
          className={`form-message ${
            isError ? "form-message--error" : "form-message--success"
          }`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default ApplyLeave;
