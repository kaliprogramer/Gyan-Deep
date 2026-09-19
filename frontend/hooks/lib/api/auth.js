const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();
    console.log("Login status:", response.status);
    console.log("Login response:", data);

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Login failed"
    );
  }

  return data;
}


export async function register(
  username,
  phone,
  email,
  role,
  password,
  profilePicture = null
) {
  const formData = new FormData();

  formData.append("username", username);
  formData.append("phone_number", phone);
  formData.append("email", email);
  formData.append("role", role);
  formData.append("password", password);

  if (profilePicture) {
    formData.append("profile_picture", profilePicture);
  }

  const response = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json();

  console.log("REGISTER STATUS:", response.status);
  console.log("REGISTER RESPONSE:", data);
  console.log(
    "REGISTER FUNCTION CALLED WITH:",
    username,
    phone,
    email,
    role,
    password,
    profilePicture
  );

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.message ||
      JSON.stringify(data) ||
      "Registration failed"
    );
  }

  return data;
}
export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Logout failed"
    );
  }

  return data;
}

export async function refreshToken() {
  const response = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Session expired");
  }

  return response.json();
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me/`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
}