import axios, { isAxiosError } from "axios";
import { CodeResponse } from "@react-oauth/google";

import { LoopInfoJson, PagedLoops } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Define types for request and response data
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface ApiResponse {
  message: string;
}

export interface LoginResponse {
  user_id: number;
  message: string;
}

export const emailLogin = async (
  credentials: LoginRequest,
): Promise<ApiResponse> => {
  try {
    const res = await apiClient.post<LoginResponse>("/login", credentials);

    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const signup = async (userData: SignupRequest): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>("/api/users", userData);

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Signup failed" };
  }
};

export const verify = async (credentials: CodeResponse) => {
  try {
    const response = await apiClient.post<ApiResponse>(
      "/oauth/google",
      credentials,
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "third party login failed" };
  }
};

export const healthCheck = async () => {
  try {
    const response = await apiClient.get<ApiResponse>("/health");

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "health check failed" };
  }
};

export const getLoopById = async (id: number) => {
  try {
    const { data } = await apiClient.get<LoopInfoJson>(`/loops/${id}`);

    return data;
  } catch (err) {
    if (isAxiosError(err)) {
      throw err.message;
    }
    throw `Unexpected error: ${err}`;
  }
};

export const getLoops = async (page: number) => {
  try {
    const { data } = await apiClient.get<PagedLoops>(`/loops?page=${page}`);

    return data;
  } catch (err) {
    if (isAxiosError(err)) {
      throw err.message;
    }
    throw `Unexpected error: ${err}`;
  }
};
