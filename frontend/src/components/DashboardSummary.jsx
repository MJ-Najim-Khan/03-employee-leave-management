import { useCallback, useEffect, useState } from "react";

import { getDashboard } from "../services/api";

const DASHBOARD_STYLES = `
  .dash {
    --ink: #1c2430;
    --ink-soft: #5b6472;
    --surface: #ffffff;
    --panel: #f4f6f8;
    --border: #dce1e7;
    --accent: #2f6f5e;
    --accent-soft: #eaf2ef;
    --warn: #a8631a;
    --warn-soft: #fbf1e6;
    --error: #b3261e;
    --error-soft: #fbeceb;
    --success: #1e824c;
    --success-soft: #eaf6ef;
    --radius: 10px;

    padding: 22px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
    color: var(--ink);
  }

  .dash__header {
    margin-bottom: 18px;
  }

  .dash__title {
    margin: 0 0 2px;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .dash__subtitle {
    margin: 0;
    font-size: 12.5px;
    color: var(--ink-soft);
  }

  .dash__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .dash__grid--has-featured .dash__stat--featured {
    grid-column: span 2;
  }

  .dash__stat {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 9px;
    border-left: 3px solid var(--tone, var(--border));
    transition: transform 120ms ease, border-color 120ms ease;
  }

  .dash__stat:hover {
    transform: translateY(-1px);
    border-color: var(--tone, var(--border));
  }

  .dash__stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dash__stat-icon {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    background: var(--tone-soft, var(--border));
    color: var(--tone, var(--ink-soft));
    flex-shrink: 0;
  }

  .dash__stat-label {
    font-size: 12px;
    color: var(--ink-soft);
    font-weight: 500;
  }

  .dash__stat-value {
    font-size: 26px;
    font-weight: 650;
    letter-spacing: -0.02em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .dash__stat--featured .dash__stat-value {
    font-size: 34px;
  }

  /* States */

  .dash__skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .dash__skeleton-card {
    height: 84px;
    border-radius: 9px;
    background: linear-gradient(
      100deg,
      var(--panel) 30%,
      #eceff2 50%,
      var(--panel) 70%
    );
    background-size: 200% 100%;
    animation: dash-shimmer 1.3s ease-in-out infinite;
    border: 1px solid var(--border);
  }

  @keyframes dash-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .dash__error {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: var(--error-soft);
    border-radius: 9px;
    color: var(--error);
  }

  .dash__error-icon {
    flex-shrink: 0;
  }

  .dash__error-text {
    flex: 1;
    font-size: 13px;
    color: var(--ink);
  }

  .dash__retry {
    flex-shrink: 0;
    padding: 7px 12px;
    background: var(--surface);
    border: 1px solid var(--error);
    color: var(--error);
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 120ms ease;
  }

  .dash__retry:hover {
    background: var(--error-soft);
  }

  .dash__retry:focus-visible,
  .dash__stat:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .dash__stat,
    .dash__retry {
      transition: none;
    }
    .dash__skeleton-card {
      animation: none;
    }
  }
`;

const ICONS = {
  clock: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v4.5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  check: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6.5 10.2l2.2 2.2L13.5 7.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  cross: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 8h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  file: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path
        d="M6 3h6l3 3v11a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 3v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <circle cx="7.5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12.5 5a2.5 2.5 0 010 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 12.3c1.9.4 3 1.7 3 3.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  userCheck: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <circle cx="7.5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13.5 8.5l1.5 1.5 2.5-2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const TONES = {
  neutral: { tone: "#5b6472", soft: "#eceff2" },
  warn: { tone: "#a8631a", soft: "#fbf1e6" },
  success: { tone: "#1e824c", soft: "#eaf6ef" },
  error: { tone: "#b3261e", soft: "#fbeceb" },
  accent: { tone: "#2f6f5e", soft: "#eaf2ef" },
};

const ROLE_CONFIG = {
  EMPLOYEE: {
    subtitle: "Your leave overview",
    stats: [
      { key: "pending_leaves", label: "Pending", icon: "clock", tone: "warn" },
      { key: "approved_leaves", label: "Approved", icon: "check", tone: "success" },
      { key: "rejected_leaves", label: "Rejected", icon: "cross", tone: "error" },
      { key: "remaining_leave_days", label: "Remaining Days", icon: "calendar", tone: "accent", featured: true },
      { key: "documents", label: "Documents", icon: "file", tone: "neutral" },
    ],
  },
  MANAGER: {
    subtitle: "Team overview",
    stats: [
      { key: "team_members", label: "Team Members", icon: "users", tone: "accent", featured: true },
      { key: "pending_leave_requests", label: "Pending Requests", icon: "clock", tone: "warn" },
      { key: "approved_leave_requests", label: "Approved", icon: "check", tone: "success" },
      { key: "rejected_leave_requests", label: "Rejected", icon: "cross", tone: "error" },
    ],
  },
  ADMIN: {
    subtitle: "Organization overview",
    stats: [
      { key: "total_users", label: "Total Users", icon: "users", tone: "neutral" },
      { key: "active_users", label: "Active Users", icon: "userCheck", tone: "accent", featured: true },
      { key: "total_employees", label: "Employees", icon: "users", tone: "neutral" },
      { key: "pending_leave_requests", label: "Pending Leaves", icon: "clock", tone: "warn" },
      { key: "documents", label: "Documents", icon: "file", tone: "neutral" },
    ],
  },
};

function StatCard({ label, value, icon, tone, featured }) {
  const { tone: toneColor, soft } = TONES[tone] || TONES.neutral;
  return (
    <div
      className={`dash__stat${featured ? " dash__stat--featured" : ""}`}
      style={{ "--tone": toneColor, "--tone-soft": soft }}
      tabIndex={0}
    >
      <div className="dash__stat-top">
        <span className="dash__stat-label">{label}</span>
        <span className="dash__stat-icon">{ICONS[icon]}</span>
      </div>
      <span className="dash__stat-value">{value ?? 0}</span>
    </div>
  );
}

function DashboardSummary({ token }) {
  const [dashboard, setDashboard] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText("");
    try {
      const data = await getDashboard(token);
      setDashboard(data);
    } catch (error) {
      setErrorText(error.message || "Couldn't load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  if (errorText) {
    return (
      <div className="dash">
        <style>{DASHBOARD_STYLES}</style>
        <div className="dash__error">
          <svg
            className="dash__error-icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10 6.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10" cy="13.5" r="0.9" fill="currentColor" />
          </svg>
          <span className="dash__error-text">{errorText}</span>
          <button
            type="button"
            className="dash__retry"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading || !dashboard) {
    return (
      <div className="dash">
        <style>{DASHBOARD_STYLES}</style>
        <div className="dash__header">
          <h2 className="dash__title">Dashboard Summary</h2>
        </div>
        <div className="dash__skeleton-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="dash__skeleton-card" key={i} />
          ))}
        </div>
      </div>
    );
  }

  const config = ROLE_CONFIG[dashboard.role];
  const data = dashboard.data;

  return (
    <div className="dash">
      <style>{DASHBOARD_STYLES}</style>

      <div className="dash__header">
        <h2 className="dash__title">Dashboard Summary</h2>
        {config?.subtitle && <p className="dash__subtitle">{config.subtitle}</p>}
      </div>

      {config && (
        <div
          className={`dash__grid${
            config.stats.some((s) => s.featured) ? " dash__grid--has-featured" : ""
          }`}
        >
          {config.stats.map((stat) => (
            <StatCard
              key={stat.key}
              label={stat.label}
              value={data[stat.key]}
              icon={stat.icon}
              tone={stat.tone}
              featured={stat.featured}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardSummary;