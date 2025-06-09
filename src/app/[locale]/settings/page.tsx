// src/app/[locale]/settings/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

/* ────────────────────── 타입 ────────────────────── */
interface UserSettings {
  profile: {
    nickname: string;
    bio: string;
    location: string;
    avatar: string;
    preferredLanguage: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    weeklyDigest: boolean;
    newPlaces: boolean;
    bookmarkReminders: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showLocation: boolean;
    showActivity: boolean;
    allowMessages: boolean;
    dataTracking: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    currency: string;
    dateFormat: string;
    distanceUnit: "km" | "miles";
    autoLocation: boolean;
    offlineMode: boolean;
  };
}
interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

/* ────────────────────── 메인 컴포넌트 ────────────────────── */
export default function SettingsPage() {
  const t = useTranslations("Settings");
  const { locale } = useParams<{ locale: string }>();

  /* 상태 */
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /* ─────────────── 설정 로딩 (mock) ─────────────── */
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      setSettings({
        profile: {
          nickname: "여행러버",
          bio: "한국의 숨은 명소를 찾아 여행하는 것을 좋아합니다.",
          location: "서울, 대한민국",
          avatar: "",
          preferredLanguage: locale,
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
          weeklyDigest: true,
          newPlaces: true,
          bookmarkReminders: true,
        },
        privacy: {
          publicProfile: true,
          showLocation: true,
          showActivity: false,
          allowMessages: true,
          dataTracking: false,
        },
        preferences: {
          theme: "light",
          currency: "KRW",
          dateFormat: "YYYY-MM-DD",
          distanceUnit: "km",
          autoLocation: true,
          offlineMode: false,
        },
      });
      setIsLoading(false);
    })();
  }, [locale]);

  /* ─────────────── 공통 헬퍼 ─────────────── */
  const updateSetting = (
    section: keyof UserSettings,
    key: string,
    value: any
  ) => {
    if (!settings) return;
    setSettings((prev) => ({
      ...prev!,
      [section]: { ...prev![section], [key]: value },
    }));
    setHasChanges(true);
  };

  const label = (ns: string, k: string) => t(`${ns}_${k}_label`);
  const desc = (ns: string, k: string) => t(`${ns}_${k}_desc`);

  /* ─────────────── 사이드바 정의 ─────────────── */
  const sections: SettingsSection[] = [
    {
      id: "profile",
      title: t("sectionProfileTitle"),
      description: t("sectionProfileDesc"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "notifications",
      title: t("sectionNotificationsTitle"),
      description: t("sectionNotificationsDesc"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM4 4l16 16"
          />
        </svg>
      ),
    },
    {
      id: "privacy",
      title: t("sectionPrivacyTitle"),
      description: t("sectionPrivacyDesc"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      id: "preferences",
      title: t("sectionPreferencesTitle"),
      description: t("sectionPreferencesDesc"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m0 14v1m8-8h1M4 12H3m14.95 6.95l.7.7M5.05 5.05l.7.7m0 12.2l-.7.7M18.364 5.636l-.707.707"
          />
        </svg>
      ),
    },
  ];

  /* ─────────────── 로딩 스켈레톤 ─────────────── */
  if (isLoading)
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex gap-8">
            <div className="w-64">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" className="h-16 mb-2" />
              ))}
            </div>
            <div className="flex-1">
              <Skeleton variant="rectangular" className="h-96" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  if (!settings) return null;

  /* ─────────────── 렌더링 ─────────────── */
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("pageHeaderTitle")}</h1>
            <p className="text-gray-600">{t("pageHeaderDesc")}</p>
          </div>

          <div className="flex gap-8">
            {/* ───── 사이드바 ───── */}
            <aside className="w-64 flex-shrink-0 space-y-1 sticky top-8">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-colors",
                    "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    activeSection === s.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                      : "text-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={cn(
                        "flex-shrink-0",
                        activeSection === s.id
                          ? "text-blue-600"
                          : "text-gray-400"
                      )}
                    >
                      {s.icon}
                    </span>
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {s.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </aside>

            {/* ───── 메인 카드 ───── */}
            <main className="flex-1">
              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center justify-between">
                    {sections.find((s) => s.id === activeSection)?.title}
                    {hasChanges && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (!settings) return;
                          setIsSaving(true);
                          await fetch("/api/user/settings", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(settings),
                          });
                          setIsSaving(false);
                          setHasChanges(false);
                          alert(t("settingsSaved"));
                        }}
                        disabled={isSaving}
                      >
                        {isSaving ? t("saving") : t("saveChanges")}
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  {/* ───────── 프로필 ───────── */}
                  {activeSection === "profile" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            {t("profileNickname")}
                          </label>
                          <Input
                            value={settings.profile.nickname}
                            onChange={(e) =>
                              updateSetting(
                                "profile",
                                "nickname",
                                e.target.value
                              )
                            }
                            placeholder={t("profileNicknamePH")}
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            {t("profileLanguage")}
                          </label>
                          <select
                            value={settings.profile.preferredLanguage}
                            onChange={(e) =>
                              updateSetting(
                                "profile",
                                "preferredLanguage",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border rounded-lg"
                          >
                            <option value="ko">한국어</option>
                            <option value="en">English</option>
                            <option value="ja">日本語</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          {t("profileBio")}
                        </label>
                        <textarea
                          value={settings.profile.bio}
                          onChange={(e) =>
                            updateSetting("profile", "bio", e.target.value)
                          }
                          placeholder={t("profileBioPH")}
                          rows={3}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          {t("profileLocation")}
                        </label>
                        <Input
                          value={settings.profile.location}
                          onChange={(e) =>
                            updateSetting("profile", "location", e.target.value)
                          }
                          placeholder={t("profileLocationPH")}
                        />
                      </div>
                    </div>
                  )}

                  {/* ───────── 알림 ───────── */}
                  {activeSection === "notifications" && (
                    <div className="space-y-6">
                      {Object.entries(settings.notifications).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {label("notifications", k)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {desc("notifications", k)}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={v}
                              onChange={(e) =>
                                updateSetting(
                                  "notifications",
                                  k,
                                  e.target.checked
                                )
                              }
                            />
                            <span className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ───────── 프라이버시 ───────── */}
                  {activeSection === "privacy" && (
                    <div className="space-y-6">
                      {Object.entries(settings.privacy).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {label("privacy", k)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {desc("privacy", k)}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={v}
                              onChange={(e) =>
                                updateSetting("privacy", k, e.target.checked)
                              }
                            />
                            <span className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ───────── 환경설정 ───────── */}
                  {activeSection === "preferences" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 테마 */}
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            {t("prefTheme")}
                          </label>
                          <select
                            value={settings.preferences.theme}
                            onChange={(e) =>
                              updateSetting(
                                "preferences",
                                "theme",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border rounded-lg"
                          >
                            <option value="light">{t("themeLight")}</option>
                            <option value="dark">{t("themeDark")}</option>
                            <option value="system">{t("themeSystem")}</option>
                          </select>
                        </div>

                        {/* 통화 */}
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            {t("prefCurrency")}
                          </label>
                          <select
                            value={settings.preferences.currency}
                            onChange={(e) =>
                              updateSetting(
                                "preferences",
                                "currency",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border rounded-lg"
                          >
                            <option value="KRW">KRW (₩)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="JPY">JPY (¥)</option>
                          </select>
                        </div>

                        {/* 거리 단위 */}
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            {t("prefDistanceUnit")}
                          </label>
                          <select
                            value={settings.preferences.distanceUnit}
                            onChange={(e) =>
                              updateSetting(
                                "preferences",
                                "distanceUnit",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border rounded-lg"
                          >
                            <option value="km">{t("unitKm")}</option>
                            <option value="miles">{t("unitMiles")}</option>
                          </select>
                        </div>

                        {/* 날짜 형식 */}
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            {t("prefDateFormat")}
                          </label>
                          <select
                            value={settings.preferences.dateFormat}
                            onChange={(e) =>
                              updateSetting(
                                "preferences",
                                "dateFormat",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border rounded-lg"
                          >
                            <option value="YYYY-MM-DD">
                              2024-06-15 (YYYY-MM-DD)
                            </option>
                            <option value="MM/DD/YYYY">
                              06/15/2024 (MM/DD/YYYY)
                            </option>
                            <option value="DD/MM/YYYY">
                              15/06/2024 (DD/MM/YYYY)
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* 토글 두 개 */}
                      {(["autoLocation", "offlineMode"] as const).map((k) => (
                        <div
                          key={k}
                          className="flex items-center justify-between mt-4 p-4 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {label("preferences", k)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {desc("preferences", k)}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={settings.preferences[k]}
                              onChange={(e) =>
                                updateSetting(
                                  "preferences",
                                  k,
                                  e.target.checked
                                )
                              }
                            />
                            <span className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* ───────── 위험 영역 카드 ───────── */}
              <Card className="mt-8 border-red-200 bg-red-50">
                <CardHeader className="border-b border-red-200">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M4 21h16l-8-18-8 18z"
                      />
                    </svg>
                    {t("dangerZone")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* 데이터 내보내기 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">
                        {t("exportTitle")}
                      </h4>
                      <p className="text-sm text-red-600 mt-1">
                        {t("exportDesc")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => setShowExportModal(true)}
                    >
                      {t("exportBtn")}
                    </Button>
                  </div>

                  {/* 계정 삭제 */}
                  <div className="border-t border-red-200 pt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">
                        {t("deleteTitle")}
                      </h4>
                      <p className="text-sm text-red-600 mt-1">
                        {t("deleteDesc")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-700 hover:bg-red-100"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      {t("deleteBtn")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>

        {/* ───────── 모달들 ───────── */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={t("deleteModalTitle")}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex">
              <svg
                className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M4 21h16l-8-18-8 18z"
                />
              </svg>
              <div className="ml-3">
                <h4 className="font-medium text-red-800">
                  {t("deleteWarnTitle")}
                </h4>
                <p className="text-sm text-red-600 mt-1">
                  {t("deleteWarnDesc")}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">{t("deleteListIntro")}</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>{t("deleteItemProfile")}</li>
              <li>{t("deleteItemBookmarks")}</li>
              <li>{t("deleteItemReviews")}</li>
              <li>{t("deleteItemHistory")}</li>
            </ul>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  await fetch("/api/user/delete", { method: "DELETE" });
                  window.location.href = "/";
                }}
              >
                {t("confirmDelete")}
              </Button>
            </div>
          </div>
        </Modal>

        {/* 데이터 내보내기 */}
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title={t("exportModalTitle")}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">{t("exportModalDesc")}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                {t("exportInclude")}
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>{t("exportItemProfile")}</li>
                <li>{t("exportItemBookmarks")}</li>
                <li>{t("exportItemReviews")}</li>
                <li>{t("exportItemHistory")}</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowExportModal(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="flex-1"
                onClick={async () => {
                  const res = await fetch("/api/user/export");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `travelkorea-${new Date()
                    .toISOString()
                    .slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                {t("download")}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
