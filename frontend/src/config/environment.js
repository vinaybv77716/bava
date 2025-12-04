// Environment configuration
const environment = {
  production: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || 'http://98.84.29.219:5000/api',
  isStatic: false,
};

export default environment;
