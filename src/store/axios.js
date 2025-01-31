import axios from "axios";
import store from "@/store";

const CORS_PROXY = "https://damp-mouse-7bce.f1webviewer.workers.dev?";
const API_URL = "https://f1tv.formula1.com";

let BASE_URL = API_URL;

if (process.env.VUE_APP_NETLIFY) {
  BASE_URL = CORS_PROXY + API_URL;
} else if (!process.env.IS_ELECTRON) {
  BASE_URL = "/proxy/" + API_URL;
}

const http = axios.create({
  baseURL: BASE_URL
});

const production = process.env.VUE_APP_NODE_ENV === "production";

http.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    if (err.response) {
      return Promise.reject(err.response);
    } else if (err.request && !production) {
      console.error(err.request);
    } else {
      console.error("Error", err);
    }

    if (!production) {
      console.error(err.config);
    }

    return Promise.reject(err);
  }
);

http.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    const originalRequest = err.config;

    if (err.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        return http(originalRequest);
      } else {
        store.commit("logout");
      }
    }

    return Promise.reject(err.data);
  }
);

export default http;
