import api from "./api";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  mobile: string;
}

interface VerifyOtpData {
  email: string;
  otp: string;
}

export const loginUser = (data: LoginData) => {
  return api.post("/auth/login", data);
};

export const googleLoginUser = (credential: string) => {
  return api.post("/auth/google", { credential });
};

export const registerUser = (data: RegisterData) => {
  return api.post("/auth/register", data);
};

export const verifyOtp = (data: VerifyOtpData) => {
  return api.post("/auth/verify-otp", data);
};

export const resendOtp = (data: { email: string }) => {
  return api.post("/auth/resend-otp", data);
};

export const forgotPassword = (data: { email: string }) => {
  return api.post("/auth/forgot-password", data);
};

export const resetPassword = (data: { email: string; otp: string; newPassword: string }) => {
  return api.post("/auth/reset-password", data);
};

export const logoutUser = () => {
  return api.post("/auth/logout");
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};