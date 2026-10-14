import axios from "axios";

export const http = axios.create({
  baseURL: "/api",
  timeout: 1000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(toMessage(error))), // To see the custom message we are sending from server and not the generic one of AxiosError
);

function toMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data?.error) return error.response.data.error;
  return "Cannot reach the server";
}
