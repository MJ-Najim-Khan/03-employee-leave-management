import { useState, useEffect, useMemo } from "react";

import Login from "./components/Login";
import EmployeeDashboard from "./components/EmployeeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import AdminDashboard from "./components/AdminDashboard";

import { getUserRole } from "./services/auth";

import "./App.css";

// Central place to theme roles — add a new role here and the topbar,
// badge, and avatar ring all pick it up automatically.
const ROLE_META = {
  ADMIN: { label: "Admin", color: "#7C3AED", tint: "#F3EEFE" },
  MANAGER: { label: "Manager", color: "#2563A8", tint: "#EAF2FB" },
  EMPLOYEE: { label: "Employee", color: "#3B7A57", tint: "#EAF5EE" },
};

function getInitials(value) {
  if (!value) return "?";
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [dashboardKey, setDashboardKey] = useState(0);

  function handleLogin(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  // Bump a key whenever the token changes so the dashboard region
  // replays its entrance animation instead of just hard-swapping.
  useEffect(() => {
    setDashboardKey((k) => k + 1);
  }, [token]);

  const { role, roleError } = useMemo(() => {
    if (!token) return { role: null, roleError: false };
    try {
      return { role: getUserRole(token), roleError: false };
    } catch {
      return { role: null, roleError: true };
    }
  }, [token]);

  if (!token) {
    return (
      <div className="app">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // A malformed or expired token shouldn't crash the tree — drop back
  // to login with a clear, non-apologetic explanation.
  if (roleError) {
    return (
      <div className="app app--error">
        <div className="session-card">
          <p className="session-card__title">Your session couldn't be read</p>
          <p className="session-card__body">
            Sign in again to continue — this usually means the session expired.
          </p>
          <button className="btn btn--primary" onClick={handleLogout}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const meta = ROLE_META[role] ?? ROLE_META.EMPLOYEE;

  function renderDashboard() {
    if (role === "ADMIN") return <AdminDashboard token={token} />;
    if (role === "MANAGER") return <ManagerDashboard token={token} />;
    return <EmployeeDashboard token={token} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark" style={{ background: meta.color }} />
          <span className="topbar__name">Workspace</span>
        </div>

        <div className="topbar__account">
          <span
            className="role-pill"
            style={{ color: meta.color, background: meta.tint }}
          >
            {meta.label}
          </span>

          <span
            className="avatar"
            style={{ borderColor: meta.color }}
            title={meta.label}
          >
            {getInitials(meta.label)}
          </span>

          <button className="btn btn--ghost" onClick={handleLogout}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-region" key={dashboardKey}>
        {renderDashboard()}
      </main>
    </div>
  );
}

export default App;
