"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/utils/cn";

// 기존 타입 패턴 활용
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

export default function SettingsPage() {
  const t = useTranslations("SettingsPage");
  const params = useParams();
  const locale = params.locale as string;

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 설정 데이터 로드
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // API 호출 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockSettings: UserSettings = {
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
        };

        setSettings(mockSettings);
      } catch (error) {
        console.error("설정 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [locale]);

  // 설정 업데이트 핸들러
  const updateSetting = (
    section: keyof UserSettings,
    key: string,
    value: any
  ) => {
    if (!settings) return;

    setSettings((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  // 설정 저장
  const handleSave = async () => {
    if (!settings || !hasChanges) return;

    setIsSaving(true);
    try {
      // API 호출
      await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      setHasChanges(false);
      // 성공 알림 (실제로는 toast 사용)
      alert(t("settingsSaved"));
    } catch (error) {
      console.error("설정 저장 실패:", error);
      alert(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  // 계정 삭제
  const handleDeleteAccount = async () => {
    try {
      await fetch("/api/user/delete", { method: "DELETE" });
      // 로그아웃 처리
      window.location.href = "/";
    } catch (error) {
      console.error("계정 삭제 실패:", error);
      alert(t("deleteError"));
    }
  };

  // 데이터 내보내기
  const handleExportData = async () => {
    try {
      const response = await fetch("/api/user/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `travelkorea-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      alert(t("exportError"));
    }
  };

  // 설정 섹션 정의
  const settingsSections: SettingsSection[] = [
    {
      id: "profile",
      title: "프로필 설정",
      description: "닉네임, 소개, 언어 등 기본 정보",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
      title: "알림 설정",
      description: "이메일, 푸시 등 알림 관리",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM4.146 4.146l14.708 14.708m-7.071-7.071l7.071 7.071M3 21v-4.8L16.2 3l2.8 2.8L6 18.8H3z"
          />
        </svg>
      ),
    },
    {
      id: "privacy",
      title: "개인정보 설정",
      description: "프로필 공개, 데이터 추적 등",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
      title: "환경설정",
      description: "테마, 통화, 단위 등",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  if (isLoading) {
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
  }

  if (!settings) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
            <p className="text-gray-600">계정 및 앱 환경을 관리하세요</p>
          </div>

          <div className="flex gap-8">
            {/* 사이드바 */}
            <div className="w-64 flex-shrink-0">
              <div className="space-y-1 sticky top-8">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg transition-colors",
                      "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : "text-gray-700"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "flex-shrink-0",
                          activeSection === section.id
                            ? "text-blue-600"
                            : "text-gray-400"
                        )}
                      >
                        {section.icon}
                      </div>
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="flex-1">
              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center justify-between">
                    {
                      settingsSections.find((s) => s.id === activeSection)
                        ?.title
                    }
                    {hasChanges && (
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? "저장 중..." : "변경사항 저장"}
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  {/* 프로필 설정 */}
                  {activeSection === "profile" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            닉네임
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
                            placeholder="닉네임을 입력하세요"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            선호 언어
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="ko">한국어</option>
                            <option value="en">English</option>
                            <option value="ja">日本語</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          소개
                        </label>
                        <textarea
                          value={settings.profile.bio}
                          onChange={(e) =>
                            updateSetting("profile", "bio", e.target.value)
                          }
                          placeholder="자신을 소개해보세요"
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          위치
                        </label>
                        <Input
                          value={settings.profile.location}
                          onChange={(e) =>
                            updateSetting("profile", "location", e.target.value)
                          }
                          placeholder="거주 지역을 입력하세요"
                        />
                      </div>
                    </div>
                  )}

                  {/* 알림 설정 */}
                  {activeSection === "notifications" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {Object.entries(settings.notifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                            >
                              <div>
                                <div className="font-medium text-gray-900">
                                  {key === "email"
                                    ? "이메일 알림"
                                    : key === "push"
                                    ? "푸시 알림"
                                    : key === "sms"
                                    ? "SMS 알림"
                                    : key === "marketing"
                                    ? "마케팅 알림"
                                    : key === "weeklyDigest"
                                    ? "주간 요약"
                                    : key === "newPlaces"
                                    ? "새로운 장소 알림"
                                    : key === "bookmarkReminders"
                                    ? "북마크 리마인더"
                                    : key}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {key === "email"
                                    ? "새로운 정보와 업데이트를 이메일로 받기"
                                    : key === "push"
                                    ? "앱에서 실시간 알림 받기"
                                    : key === "sms"
                                    ? "중요한 알림을 문자로 받기"
                                    : key === "marketing"
                                    ? "프로모션과 이벤트 정보 받기"
                                    : key === "weeklyDigest"
                                    ? "매주 인기 장소 요약 받기"
                                    : key === "newPlaces"
                                    ? "관심 지역 새 장소 알림"
                                    : key === "bookmarkReminders"
                                    ? "북마크한 장소 방문 알림"
                                    : ""}
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) =>
                                    updateSetting(
                                      "notifications",
                                      key,
                                      e.target.checked
                                    )
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 프라이버시 설정 */}
                  {activeSection === "privacy" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {Object.entries(settings.privacy).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                            >
                              <div>
                                <div className="font-medium text-gray-900">
                                  {key === "publicProfile"
                                    ? "공개 프로필"
                                    : key === "showLocation"
                                    ? "위치 표시"
                                    : key === "showActivity"
                                    ? "활동 공개"
                                    : key === "allowMessages"
                                    ? "메시지 허용"
                                    : key === "dataTracking"
                                    ? "데이터 추적"
                                    : key}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {key === "publicProfile"
                                    ? "다른 사용자가 내 프로필을 볼 수 있도록 허용"
                                    : key === "showLocation"
                                    ? "프로필에서 위치 정보 표시"
                                    : key === "showActivity"
                                    ? "북마크, 방문 기록 등 활동 공개"
                                    : key === "allowMessages"
                                    ? "다른 사용자의 메시지 받기"
                                    : key === "dataTracking"
                                    ? "서비스 개선을 위한 사용 데이터 수집 허용"
                                    : ""}
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) =>
                                    updateSetting(
                                      "privacy",
                                      key,
                                      e.target.checked
                                    )
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 환경설정 */}
                  {activeSection === "preferences" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            테마
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="light">라이트 모드</option>
                            <option value="dark">다크 모드</option>
                            <option value="system">시스템 설정 따름</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            통화
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="KRW">KRW (₩)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="JPY">JPY (¥)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            거리 단위
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="km">킬로미터</option>
                            <option value="miles">마일</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            날짜 형식
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="YYYY-MM-DD">2024-06-15</option>
                            <option value="MM/DD/YYYY">06/15/2024</option>
                            <option value="DD/MM/YYYY">15/06/2024</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {["autoLocation", "offlineMode"].map((key) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {key === "autoLocation"
                                  ? "자동 위치 감지"
                                  : "오프라인 모드"}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {key === "autoLocation"
                                  ? "현재 위치를 자동으로 감지하여 주변 정보 제공"
                                  : "데이터 사용량 절약을 위한 오프라인 모드"}
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  settings.preferences[
                                    key as keyof typeof settings.preferences
                                  ] as boolean
                                }
                                onChange={(e) =>
                                  updateSetting(
                                    "preferences",
                                    key,
                                    e.target.checked
                                  )
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 위험 영역 */}
              <Card className="mt-8 border-red-200 bg-red-50">
                <CardHeader className="border-b border-red-200">
                  <CardTitle className="text-red-800 flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span>위험 영역</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-800">
                          데이터 내보내기
                        </h4>
                        <p className="text-sm text-red-600 mt-1">
                          개인 데이터를 JSON 파일로 다운로드합니다
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowExportModal(true)}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        데이터 내보내기
                      </Button>
                    </div>

                    <div className="border-t border-red-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800">
                            계정 삭제
                          </h4>
                          <p className="text-sm text-red-600 mt-1">
                            모든 데이터가 영구적으로 삭제됩니다
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteModal(true)}
                          className="border-red-500 text-red-700 hover:bg-red-100"
                        >
                          계정 삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 계정 삭제 확인 모달 */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="계정 삭제 확인"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-red-800">⚠️ 주의</h4>
                  <p className="text-sm text-red-600 mt-1">
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                계정을 삭제하면 다음 데이터가 영구적으로 삭제됩니다:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 ml-4">
                <li>프로필 정보 및 설정</li>
                <li>북마크한 모든 장소</li>
                <li>작성한 리뷰 및 댓글</li>
                <li>여행 기록 및 통계</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                계정 삭제
              </Button>
            </div>
          </div>
        </Modal>

        {/* 데이터 내보내기 확인 모달 */}
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="데이터 내보내기"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              개인 데이터를 JSON 형식으로 다운로드합니다.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                포함되는 데이터:
              </h4>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>프로필 정보</li>
                <li>북마크한 장소 목록</li>
                <li>작성한 리뷰 및 평점</li>
                <li>여행 기록 및 방문 장소</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button onClick={handleExportData} className="flex-1">
                다운로드
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
