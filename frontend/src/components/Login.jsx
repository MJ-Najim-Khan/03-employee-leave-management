import { useState } from "react";
import { loginUser } from "../services/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const data = await loginUser(username, password);

      localStorage.setItem("token", data.access_token);

      onLogin(data.access_token);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="card login-card">
        <span className="brand-mark" aria-hidden="true" />

        <h2>Employee Leave Management</h2>
        <p className="login-subtitle">Sign in with your work account.</p>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.5 0-9.5-4-11-8a17.9 17.9 0 0 1 4.22-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c5.5 0 9.5 4 11 8a17.9 17.9 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading} aria-busy={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {message && (
          <p
            className={`form-message ${isError ? "form-message--error" : "form-message--success"}`}
            role={isError ? "alert" : "status"}
          >
            {message}
          </p>
        )}

        <p className="login-footnote">
          Trouble signing in? Contact your admin.
        </p>
      </div>
    </div>
  );
}

export default Login;
