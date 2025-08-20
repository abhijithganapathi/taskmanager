import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:3005', // local
  //baseURL: 'http://54.206.91.195:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
