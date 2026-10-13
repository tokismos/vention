import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 1000,
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data?.error) return error.response.data.error;
  return "Cannot reach the server";
}
