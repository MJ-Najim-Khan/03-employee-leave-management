const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


export async function loginUser(username, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}


export async function getEmployeeBalances(employeeId, token) {
  const response = await fetch(
    `${API_URL}/api/employees/${employeeId}/balances`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to load leave balance"
    );
  }

  return data;
}


export async function createLeave(
  employeeId,
  leaveTypeId,
  fromDate,
  toDate,
  reason,
  token
) {
  const response = await fetch(`${API_URL}/api/leaves`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      employee_id: Number(employeeId),
      leave_type_id: Number(leaveTypeId),
      from_date: fromDate,
      to_date: toDate,
      reason,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Leave request failed"
    );
  }

  return data;
}


export async function getLeaves(token) {
  const response = await fetch(`${API_URL}/api/leaves`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to load leave requests"
    );
  }

  return data;
}


export async function approveLeave(
  leaveId,
  comment,
  token
) {
  const response = await fetch(
    `${API_URL}/api/leaves/${leaveId}/approve`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        comment,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to approve leave"
    );
  }

  return data;
}


export async function rejectLeave(
  leaveId,
  comment,
  token
) {
  const response = await fetch(
    `${API_URL}/api/leaves/${leaveId}/reject`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        comment,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to reject leave"
    );
  }

  return data;
}

export async function getEmployeeLeaveHistory(
  employeeId,
  token
) {
  const response = await fetch(
    `${API_URL}/api/leaves/employees/${employeeId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to load leave history"
    );
  }

  return data;
}


export async function cancelLeave(
  leaveId,
  token
) {
  const response = await fetch(
    `${API_URL}/api/leaves/${leaveId}/cancel`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to cancel leave"
    );
  }

  return data;
}

export async function uploadDocument(
  employeeId,
  file,
  token
) {
  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response = await fetch(
    `${API_URL}/api/documents/upload?employee_id=${employeeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Document upload failed"
    );
  }

  return data;
}

export async function getEmployeeDocuments(
  employeeId,
  token
) {
  const response = await fetch(
    `${API_URL}/api/documents/employee/${employeeId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Unable to load documents"
    );
  }

  return data;
}


export async function getDocumentDownloadUrl(
  documentId,
  token
) {
  const response = await fetch(
    `${API_URL}/api/documents/${documentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Unable to generate download URL"
    );
  }

  return data;
}

export async function getDashboard(token) {
  const response = await fetch(
    `${API_URL}/api/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Unable to load dashboard"
    );
  }

  return data;
}