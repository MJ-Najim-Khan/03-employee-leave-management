export function getUserRole(token) {
  try {
    const payload = token.split(".")[1];

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      atob(base64)
    );

    return decoded.role;
  } catch {
    return null;
  }
}