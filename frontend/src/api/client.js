// Base API Client Configuration
// Automatically connects to Render backend in production and localhost in development

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If envUrl is a valid http/https URL, use it
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // When running on live cloud domain (e.g. *.vercel.app), automatically route to Render backend
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    return 'https://riskradar-backend-6edw.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Clean up any legacy localStorage session data to enforce strict tab-session lifecycle
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('riskradar_token');
    localStorage.removeItem('riskradar_user');
  } catch (e) {}
}

export async function apiRequest(endpoint, options = {}) {
  // Read token strictly from sessionStorage (tab-scoped session)
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('riskradar_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const controller = new AbortController();
  // 35s timeout allows Render free instance to spin up smoothly if it was in cold-sleep
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || 'An unexpected error occurred.');
      error.status = response.status;
      error.field = data.field || null;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Cloud backend is waking up (cold start). Please wait 15-20 seconds and click Sign In again.');
    }
    throw err;
  }
}
