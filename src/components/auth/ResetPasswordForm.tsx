"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyResetCode, resetPassword } from "@/lib/auth";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordValid = useMemo(() => {
    return (
      password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
    );
  }, [password]);

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !code || code.length !== 6) {
      setError("Vui lòng nhập email và mã 6 số");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyResetCode(email, code);
      setResetToken(data.reset_token);
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!resetToken) {
      setError("Thiếu mã xác thực đặt lại mật khẩu");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!passwordValid) {
      setError("Mật khẩu phải ≥8 ký tự, gồm chữ hoa, chữ thường và số");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, password, passwordConfirm);
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 1800);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to Sign In
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đặt lại mật khẩu
            </h1>
            {step === "verify" ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nhập email và mã 6 chữ số đã được gửi qua email của bạn.
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nhập mật khẩu mới của bạn. Yêu cầu: tối thiểu 8 ký tự, có chữ hoa, chữ thường và số.
              </p>
            )}
          </div>

          {success ? (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                Password reset successfully! Redirecting to sign in...
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          ) : null}

          {step === "verify" ? (
            <form onSubmit={handleVerify} className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || success}
                />
              </div>
              <div>
                <Label htmlFor="code">Mã xác minh (6 số)</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Nhập mã 6 số"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  required
                  disabled={loading || success}
                />
              </div>
              <Button disabled={loading || success} className="w-full">
                {loading ? "Đang kiểm tra..." : "Xác minh mã"}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mã hết hạn sau 3 phút</p>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="password">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Yêu cầu: ≥8 ký tự, gồm chữ hoa, chữ thường và số
                </p>
              </div>

              <div>
                <Label htmlFor="passwordConfirm">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {showPasswordConfirm ? <EyeIcon /> : <EyeCloseIcon />}
                  </button>
                </div>
              </div>

              <Button disabled={loading || success} className="w-full">
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
