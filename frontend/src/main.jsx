import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

// A crash anywhere in the component tree (a bad API response shape, a
// bug in a dashboard, etc.) would otherwise unmount the whole app and
// leave the user staring at a blank page with no explanation. This
// catches that and shows something recoverable instead.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled error in app:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <div className="app-crash">
      <style>{ERROR_FALLBACK_STYLES}</style>

      <div className="app-crash__card">
        <svg
          className="app-crash__icon"
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
        >
          <path
            d="M15 3.5L27 24.5H3L15 3.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M15 12v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="15" cy="21" r="0.9" fill="currentColor" />
        </svg>

        <h1 className="app-crash__title">Something went wrong</h1>
        <p className="app-crash__body">
          The page hit an unexpected error. Refreshing usually fixes it — if it
          keeps happening, let support know and we'll dig in.
        </p>

        <div className="app-crash__actions">
          <button
            type="button"
            className="app-crash__primary"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>
          <a className="app-crash__secondary" href="mailto:support@example.com">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}

const ERROR_FALLBACK_STYLES = `
  .app-crash {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #f4f6f8;
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
  }

  .app-crash__card {
    width: 100%;
    max-width: 360px;
    text-align: center;
    background: #ffffff;
    border: 1px solid #dce1e7;
    border-radius: 12px;
    padding: 32px 28px;
  }

  .app-crash__icon {
    color: #b3261e;
    margin-bottom: 14px;
  }

  .app-crash__title {
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #1c2430;
  }

  .app-crash__body {
    margin: 0 0 22px;
    font-size: 13.5px;
    line-height: 1.5;
    color: #5b6472;
  }

  .app-crash__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .app-crash__primary {
    width: 100%;
    padding: 10px 16px;
    background: #2f6f5e;
    color: #fff;
    border: none;
    border-radius: 7px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 120ms ease, transform 80ms ease;
  }

  .app-crash__primary:hover {
    background: #265a4c;
  }

  .app-crash__primary:active {
    transform: scale(0.98);
  }

  .app-crash__secondary {
    font-size: 12.5px;
    font-weight: 600;
    color: #5b6472;
    text-decoration: none;
  }

  .app-crash__secondary:hover {
    color: #1c2430;
    text-decoration: underline;
  }

  .app-crash__primary:focus-visible,
  .app-crash__secondary:focus-visible {
    outline: 2px solid #2f6f5e;
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .app-crash__primary {
      transition: none;
    }
  }
`;

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Root element with id "root" not found — check that index.html contains <div id="root"></div>.'
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
