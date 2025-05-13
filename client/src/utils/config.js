import axios from "axios";
 const axiosInstance = axios.create({
    baseURL : "https://anbu-printing-offset-consultancy.onrender.com/api",
    timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})
export default axiosInstance;