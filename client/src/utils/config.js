import axios from "axios";

const axiosInstance = axios.create({
  // Use relative URL so it works both locally and in production
  baseURL: "/api",
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;