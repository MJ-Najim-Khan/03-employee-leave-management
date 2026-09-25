// Central API client. Every component talks to the backend through these
// helpers instead of hand-rolling fetch, so auth headers and error handling
// stay consistent across the app.

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const { method = "GET", token, body, isForm = false } = options;

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isForm && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }

  return data;
}

function getErrorMessage(data, status) {
  const detail = data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const first = detail[0];
    const location = first?.loc?.slice(1).join(".") || "request";
    const message = first?.msg || "validation error";
    return `${message} (${location})`;
  }

  return `Request failed with status ${status}`;
}

// --------------------------------------------------
// Authentication
// --------------------------------------------------

export async function loginUser(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

// --------------------------------------------------
// Dashboard
// --------------------------------------------------

export async function getDashboard(token) {
  return request("/api/dashboard", { token });
}

// --------------------------------------------------
// Leave balances
// --------------------------------------------------

export async function getEmployeeBalances(employeeId, token) {
  return request(`/api/employees/${employeeId}/balances`, { token });
}

// --------------------------------------------------
// Leaves
// --------------------------------------------------

export async function createLeave(
  employeeId,
  leaveTypeId,
  fromDate,
  toDate,
  reason,
  token
) {
  return request("/api/leaves", {
    method: "POST",
    token,
    body: {
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      from_date: fromDate,
      to_date: toDate,
      reason: reason || null,
    },
  });
}

export async function getLeaves(token) {
  return request("/api/leaves", { token });
}

export async function getEmployeeLeaveHistory(employeeId, token) {
  return request(`/api/leaves/employees/${employeeId}`, { token });
}

export async function cancelLeave(leaveId, token) {
  return request(`/api/leaves/${leaveId}/cancel`, {
    method: "PUT",
    token,
  });
}

export async function approveLeave(leaveId, comment, token) {
  return request(`/api/leaves/${leaveId}/approve`, {
    method: "PUT",
    token,
    body: { comment: comment || null },
  });
}

export async function rejectLeave(leaveId, comment, token) {
  return request(`/api/leaves/${leaveId}/reject`, {
    method: "PUT",
    token,
    body: { comment: comment || null },
  });
}

// --------------------------------------------------
// Documents
// --------------------------------------------------

export async function getEmployeeDocuments(employeeId, token) {
  return request(`/api/documents/employee/${employeeId}`, { token });
}

export async function getDocumentDownloadUrl(documentId, token) {
  return request(`/api/documents/${documentId}/download`, { token });
}

export async function uploadDocument(employeeId, file, token) {
  const formData = new FormData();
  formData.append("file", file);

  return request(`/api/documents/upload?employee_id=${employeeId}`, {
    method: "POST",
    token,
    body: formData,
    isForm: true,
  });
}
