const BASE_URL = 'http://auth-service-env.eba-kuabnady.us-east-1.elasticbeanstalk.com';

async function parseResponse(res) {
  let text = '';
  try {
    text = await res.text();
  } catch (e) {
    return { rawResponse: `Failed to read body: ${e.message}`, status: res.status };
  }
  if (!text) {
    return { status: res.status };
  }
  try {
    return { ...JSON.parse(text), status: res.status };
  } catch {
    return { rawResponse: text, status: res.status };
  }
}

const REGISTER_ERRORS = {
  400: 'Invalid fields — check email format and password (min 8 characters)',
  403: 'Registration not allowed — permission denied',
  500: 'This email is already registered — try logging in instead',
};

const LOGIN_ERRORS = {
  400: 'Invalid request — email and password are required',
  401: 'Wrong email or password',
  403: 'Wrong email or password',
  404: 'Account not found — register first',
};

const PROFILE_ERRORS = {
  401: 'Session expired — please login again',
  403: 'Not logged in or token expired — please login again',
};

const ADMIN_ERRORS = {
  401: 'Session expired — please login again',
  403: 'Access denied — you need an admin account to view this',
};

function getErrorMessage(status, errorMap, data, fallback) {
  if (data.message) return data.message;
  if (errorMap[status]) return errorMap[status];
  if (data.rawResponse) return data.rawResponse;
  return `${fallback} (HTTP ${status})`;
}

export async function register({ name, email, password, role }) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(getErrorMessage(res.status, REGISTER_ERRORS, data, 'Registration failed'));
  return data;
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(getErrorMessage(res.status, LOGIN_ERRORS, data, 'Login failed'));
  return data;
}

export async function getProfile(token) {
  const res = await fetch(`${BASE_URL}/api/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(getErrorMessage(res.status, PROFILE_ERRORS, data, 'Failed to fetch profile'));
  return data;
}

export async function getAdminDashboard(token) {
  const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(getErrorMessage(res.status, ADMIN_ERRORS, data, 'Failed to load dashboard'));
  return data;
}
