import { useEffect, useState } from "react";
import DashboardSummary from "./DashboardSummary";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ROLE_TAG_CLASS = {
  ADMIN: "role-tag--admin",
  MANAGER: "role-tag--manager",
  EMPLOYEE: "role-tag--employee",
};

function StatusBadge({ active, activeLabel = "Active", inactiveLabel = "Inactive" }) {
  return (
    <span
      className={`status-badge ${
        active ? "status-badge--approved" : "status-badge--cancelled"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function AdminDashboard({ token }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [users, setUsers] = useState([]);

  const [departmentName, setDepartmentName] = useState("");
  const [leaveTypeName, setLeaveTypeName] = useState("");
  const [leaveTypeDays, setLeaveTypeDays] = useState(12);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function apiRequest(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Request failed");
    }

    return data;
  }

  async function loadData() {
    try {
      setLoading(true);

      const [employeeData, departmentData, leaveTypeData, userData] =
        await Promise.all([
          apiRequest("/api/employees"),
          apiRequest("/api/admin/departments"),
          apiRequest("/api/admin/leave-types"),
          apiRequest("/api/admin/users"),
        ]);

      setEmployees(employeeData);
      setDepartments(departmentData);
      setLeaveTypes(leaveTypeData);
      setUsers(userData);
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
    loadData();
  }, []);

  async function createDepartment(event) {
    event.preventDefault();

    try {
      await apiRequest("/api/admin/departments", {
        method: "POST",
        body: JSON.stringify({ name: departmentName }),
      });

      setDepartmentName("");
      setIsError(false);
      setMessage("Department created successfully");

      await loadData();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  }

  async function createLeaveType(event) {
    event.preventDefault();

    try {
      await apiRequest("/api/admin/leave-types", {
        method: "POST",
        body: JSON.stringify({
          name: leaveTypeName,
          default_days: Number(leaveTypeDays),
        }),
      });

      setLeaveTypeName("");
      setIsError(false);
      setMessage("Leave type created successfully");

      await loadData();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  }

  async function disableUser(userId, username) {
    const confirmed = window.confirm(
      `Disable ${username}? They will lose access immediately.`
    );
    if (!confirmed) return;

    try {
      await apiRequest(`/api/admin/users/${userId}/disable`, {
        method: "PUT",
      });

      setIsError(false);
      setMessage("User disabled successfully");

      await loadData();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <DashboardSummary token={token} />

      {message && (
        <div
          className={`message ${isError ? "message--error" : ""}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </div>
      )}

      {/* Employees */}
      <section className="admin-section">
        <div className="admin-section__head">
          <h2>Employees</h2>
          {!loading && <span className="count-pill">{employees.length}</span>}
        </div>

        {loading ? (
          <div className="skeleton-block" />
        ) : employees.length === 0 ? (
          <p className="empty-state">No employees yet.</p>
        ) : (
          employees.map((employee) => (
            <div className="admin-row" key={employee.id}>
              <span>
                <strong>{employee.employee_code}</strong>
                {" - "}
                {employee.first_name} {employee.last_name || ""}
              </span>

              <StatusBadge active={employee.active} />
            </div>
          ))
        )}
      </section>

      {/* Departments */}
      <section className="admin-section">
        <div className="admin-section__head">
          <h2>Departments</h2>
          {!loading && (
            <span className="count-pill">{departments.length}</span>
          )}
        </div>

        {loading ? (
          <div className="skeleton-block" />
        ) : departments.length === 0 ? (
          <p className="empty-state">No departments yet.</p>
        ) : (
          departments.map((department) => (
            <div className="admin-row" key={department.id}>
              {department.name}
            </div>
          ))
        )}

        <form className="quick-add" onSubmit={createDepartment}>
          <div className="field field--grow">
            <label htmlFor="departmentName">Department name</label>
            <input
              id="departmentName"
              placeholder="e.g. Finance"
              value={departmentName}
              onChange={(event) => setDepartmentName(event.target.value)}
              required
            />
          </div>
          <button type="submit">Add department</button>
        </form>
      </section>

      {/* Leave Types */}
      <section className="admin-section">
        <div className="admin-section__head">
          <h2>Leave Types</h2>
          {!loading && (
            <span className="count-pill">{leaveTypes.length}</span>
          )}
        </div>

        {loading ? (
          <div className="skeleton-block" />
        ) : leaveTypes.length === 0 ? (
          <p className="empty-state">No leave types yet.</p>
        ) : (
          leaveTypes.map((leaveType) => (
            <div className="admin-row" key={leaveType.id}>
              <span>{leaveType.name}</span>
              <span>{leaveType.default_days} days</span>
            </div>
          ))
        )}

        <form className="quick-add" onSubmit={createLeaveType}>
          <div className="field field--grow">
            <label htmlFor="leaveTypeName">Leave type name</label>
            <input
              id="leaveTypeName"
              placeholder="e.g. Sick leave"
              value={leaveTypeName}
              onChange={(event) => setLeaveTypeName(event.target.value)}
              required
            />
          </div>

          <div className="field field--compact">
            <label htmlFor="leaveTypeDays">Default days</label>
            <input
              id="leaveTypeDays"
              type="number"
              min="1"
              value={leaveTypeDays}
              onChange={(event) => setLeaveTypeDays(event.target.value)}
              required
            />
          </div>

          <button type="submit">Add leave type</button>
        </form>
      </section>

      {/* Users */}
      <section className="admin-section">
        <div className="admin-section__head">
          <h2>Users</h2>
          {!loading && <span className="count-pill">{users.length}</span>}
        </div>

        {loading ? (
          <div className="skeleton-block" />
        ) : users.length === 0 ? (
          <p className="empty-state">No users yet.</p>
        ) : (
          users.map((user) => (
            <div className="admin-row" key={user.id}>
              <div>
                <strong>{user.username}</strong>
                <div className="admin-row__email">{user.email}</div>
                <span
                  className={`role-tag ${ROLE_TAG_CLASS[user.role] || ""}`}
                >
                  {user.role}
                </span>
              </div>

              <div className="admin-row__actions">
                <StatusBadge
                  active={user.is_active}
                  inactiveLabel="Disabled"
                />

                {user.is_active && user.role !== "ADMIN" && (
                  <button
                    className="disable-button"
                    onClick={() => disableUser(user.id, user.username)}
                  >
                    Disable
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
