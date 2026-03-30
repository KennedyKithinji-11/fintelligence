import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  // No default Content-Type — let each request set its own
});

// REQUEST interceptor: attach JWT to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Set Content-Type based on data type
  if (config.data instanceof URLSearchParams) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (config.data) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// RESPONSE interceptor: on 401, try to refresh and retry
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${original.baseURL}/auth/refresh`,
            { refresh_token: refresh }
          );
          localStorage.setItem('access_token', data.access_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return client(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;