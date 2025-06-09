/* ----------------------------------------------------------------
   src/app/[locale]/signup/page.tsx
   – 모든 한국어 문자열을 i18n key로 치환한 리팩터링 버전
---------------------------------------------------------------- */
"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { API_PATH } from "@/constants/apiPath";
interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  preferredLanguage: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export default function SignupPage() {
  /* ─────────────────────────── hooks ─────────────────────────── */
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("signup");

  /* ─────────────────────────── state ──────────────────────────── */
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    preferredLanguage: locale,
    agreeToTerms: false,
    agreeToPrivacy: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ──────────────────── util: email / password ────────────────── */
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const calcPasswordStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  /* ───────────────────────── handlers ─────────────────────────── */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;

    /* 1) 체크박스 ----------------------------- */
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return; // <-- 문자열 처리와 분리
    }

    /* 2) 문자열 ------------------------------- */
    const value = e.target.value; // value 는 이제 string ✔
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(calcPasswordStrength(value)); // no TS error
    }

    if (error) setError("");
  };
  const API_BASE = process.env.NEXT_PUBLIC_API ?? "http://localhost:8080/api";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    /* ───── validation ───── */
    if (!formData.email) return setError(t("emailRequired"));
    if (!validateEmail(formData.email)) return setError(t("invalidEmail"));
    if (!formData.password) return setError(t("passwordRequired"));
    if (formData.password.length < 8) return setError(t("passwordTooShort"));
    if (formData.password !== formData.confirmPassword)
      return setError(t("passwordMismatch"));
    if (!formData.nickname) return setError(t("nicknameRequired"));
    if (!formData.agreeToTerms) return setError(t("termsRequired"));
    if (!formData.agreeToPrivacy) return setError(t("privacyRequired"));

    /* ───── API simulation ───── */
    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE}${API_PATH.SIGN_UP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          nickname: formData.nickname,
          preferredLanguage: formData.preferredLanguage,
        }),
      });

      if (!res.ok) {
        // 409, 400 … ⇒ 백엔드에서 반환한 메시지 읽기
        const { message } = await res.json().catch(() => ({ message: "" }));
        throw new Error(message || t("signupFailed"));
      }

      /* 성공 → 로그인 페이지로 */
      window.location.href = `/${locale}/login?signup=success`;
    } catch {
      setError(t("signupFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  /* ───────────────────────── UI helpers ───────────────────────── */
  const strengthColor = [
    "bg-red-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-500",
  ][passwordStrength];
  const strengthLabel =
    passwordStrength < 2
      ? t("passwordWeak")
      : passwordStrength < 4
      ? t("passwordMedium")
      : t("passwordStrong");

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* ── title ── */}
        <header className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{t("subtitle")}</p>
        </header>

        {/* ── form ── */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-xl shadow-lg p-8 space-y-6"
        >
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* 이메일 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t("emailPlaceholder")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 px-4 text-base"
            />
          </div>

          {/* 닉네임 */}
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700"
            >
              {t("nickname")}
            </label>
            <input
              id="nickname"
              name="nickname"
              required
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder={t("nicknamePlaceholder")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 px-4 text-base "
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {t("password")}
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t("passwordPlaceholder")}
                className="block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 px-4 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {formData.password && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all ${strengthColor}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              {t("confirmPassword")}
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder={t("confirmPasswordPlaceholder")}
                className="block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 px-4 text-base"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {t("passwordMismatch")}
                </p>
              )}
          </div>

          {/* 언어 */}
          <div>
            <label
              htmlFor="preferredLanguage"
              className="block text-sm font-medium text-gray-700"
            >
              {t("preferredLanguage")}
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 px-4 text-base"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>

          {/* 약관 / 개인정보 동의 */}
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                {t("agreeToTerms")}{" "}
                <a
                  href={`/${locale}/terms`}
                  className="text-blue-600 hover:underline"
                >
                  {t("termsOfService")}
                </a>
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="agreeToPrivacy"
                checked={formData.agreeToPrivacy}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                {t("agreeToPrivacy")}{" "}
                <a
                  href={`/${locale}/privacy`}
                  className="text-blue-600 hover:underline"
                >
                  {t("privacyPolicy")}
                </a>
              </span>
            </label>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="mr-3 h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {t("creating")}
              </>
            ) : (
              t("button")
            )}
          </button>

          {/* 로그인 링크 */}
          <p className="text-center text-sm text-gray-600">
            {t("hasAccount")}{" "}
            <a
              href={`/${locale}/login`}
              className="font-medium text-blue-600 hover:underline"
            >
              {t("login")}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
