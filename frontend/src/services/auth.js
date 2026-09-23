export const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
};

export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (user?.role) {
    return user.role.toUpperCase();
  }

  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return (
      payload.role ||
      payload.roles?.[0] ||
      payload.user_role ||
      null
    )?.toUpperCase();
  } catch (error) {
    console.error("Unable to decode JWT:", error);
    return null;
  }
};