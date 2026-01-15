// src/lib/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

import { User } from "@/context/AuthContext";

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

/* ================= LOGIN ================= */
export type SigninResponse = {
  token: string;
  user: User;
}

export async function signin(
  email: string,
  password: string
): Promise<SigninResponse> {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("PLEASE_VERIFY_EMAIL");
    }

    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem("token", data.token);
  return data;
}


/* ================= ME ================= */

export async function getMe(token?: string) {
  const t = token ?? localStorage.getItem("token");
  if (!t) throw new Error("No token");

  const res = await fetch(`${API_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${t}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

/* ================= SIGNUP (FIX LỖI BUILD) ================= */

export async function signup(
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.join(", ") || "Signup failed");
  }
}

/* ================= LOGOUT ================= */

export async function signout() {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_URL}/api/logout`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // ignore
  } finally {
    localStorage.removeItem("token");
  }
}
/* ================= VERIFY EMAIL ================= */

export async function verifyEmail(token: string) {
  localStorage.removeItem("token");

  const res = await fetch(
    `${API_URL}/api/verify-email?token=${token}`
  );

  const data = await res.json();
  console.log("VERIFY API RESPONSE:", data);

  if (!res.ok || !data.token || !data.user) {
    throw new Error(data.error || "Verify email failed");
  }

  localStorage.setItem("token", data.token);
  return data;
}

/* ================= PASSWORD RESET FLOW ================= */

export type ForgotPasswordResponse = {
  message: string;
  email: string;
};

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  const res = await fetch(`${API_URL}/api/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Failed to send reset code");
  }
  return data;
}

export type VerifyResetCodeResponse = {
  status: "valid";
  message: string;
  reset_token: string;
  email: string;
};

export async function verifyResetCode(email: string, code: string): Promise<VerifyResetCodeResponse> {
  const res = await fetch(`${API_URL}/api/verify-reset-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Invalid or expired reset code");
  }
  return data;
}

export type ResetPasswordResponse = {
  message: string;
  user: { id: number; email: string };
};

export async function resetPassword(resetToken: string, password: string, passwordConfirmation: string): Promise<ResetPasswordResponse> {
  const res = await fetch(`${API_URL}/api/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resetToken}`,
    },
    body: JSON.stringify({ password, password_confirmation: passwordConfirmation }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.errors?.join?.(", ") || data?.error || data?.message || "Password reset failed";
    throw new Error(msg);
  }
  return data;
}


