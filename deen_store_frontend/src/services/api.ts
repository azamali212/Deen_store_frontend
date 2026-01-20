import axios from "axios";
import { AuthStorage } from "@/core/auth/auth.storage";

export function createAuthApiClient(
  portal: "admin" | "customer"
) {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = AuthStorage.getAccessToken(portal);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}