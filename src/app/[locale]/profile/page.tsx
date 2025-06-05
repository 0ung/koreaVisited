"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/utils/cn";

// 타입 정의
interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  preferredLanguage: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  stats: {
    bookmarksCount: number;
    visitedCount: number;
    reviewsCount: number;
    totalTripDays: number;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publicProfile: boolean;
    showLocation: boolean;
  };
}

interface UserActivity {
  id: string;
  type: "bookmark" | "visit" | "review" | "plan";
  placeName: string;
  placeId: string;
  action: string;
  timestamp: string;
  rating?: number;
}

export default function ProfilePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: "",
    bio: "",
    location: "",
    preferredLanguage: "",
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);

      try {
        // 실제로는 API 호출: /api/user/profile
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockProfile: UserProfile = {
          id: "user-123",
          email: "user@example.com",
          nickname: "여행러버",
          preferredLanguage: locale,
          avatar: "",
          bio: "한국의 숨은 명소를 찾아 여행하는 것을 좋아합니다.",
          location: "서울, 대한민국",
          joinedAt: "2024-01-15T00:00:00Z",
          stats: {
            bookmarksCount: 47,
            visitedCount: 23,
            reviewsCount: 12,
            totalTripDays: 85,
          },
          preferences: {
            emailNotifications: true,
            pushNotifications: false,
            publicProfile: true,
            showLocation: true,
          },
        };

        const mockActivity: UserActivity[] = [
          {
            id: "1",
            type: "bookmark",
            placeName: "부산 감천문화마을",
            placeId: "place-1",
            action: "북마크에 추가했습니다",
            timestamp: "2024-03-15T10:30:00Z",
          },
          {
            id: "2",
            type: "visit",
            placeName: "홍대 합정역 카페거리",
            placeId: "place-2",
            action: "방문 완료했습니다",
            timestamp: "2024-03-14T16:45:00Z",
          },
          {
            id: "3",
            type: "review",
            placeName: "명동 칼국수 골목",
            placeId: "place-3",
            action: "리뷰를 작성했습니다",
            timestamp: "2024-03-13T12:20:00Z",
            rating: 5,
          },
          {
            id: "4",
            type: "plan",
            placeName: "제주 성산일출봉",
            placeId: "place-4",
            action: "여행 계획에 추가했습니다",
            timestamp: "2024-03-12T09:10:00Z",
          },
        ];

        setUserProfile(mockProfile);
        setRecentActivity(mockActivity);
        setEditForm({
          nickname: mockProfile.nickname,
          bio: mockProfile.bio || "",
          location: mockProfile.location || "",
          preferredLanguage: mockProfile.preferredLanguage,
        });
      } catch (error) {
        console.error("프로필 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [locale]);

  // 프로필 업데이트
  const handleSaveProfile = async () => {
    if (!userProfile) return;

    try {
      // 실제로는 API 호출: PUT /api/user/profile
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              nickname: editForm.nickname,
              bio: editForm.bio,
              location: editForm.location,
              preferredLanguage: editForm.preferredLanguage,
            }
          : null
      );

      setIsEditing(false);
      // TODO: 성공 토스트 표시
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      // TODO: 에러 토스트 표시
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 실제로는 API 호출: PUT /api/user/password
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordModalOpen(false);
      // TODO: 성공 토스트 표시
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      // TODO: 에러 토스트 표시
    }
  };

  // 활동 아이콘
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bookmark":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
        );
      case "visit":
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "review":
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case "plan":
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <Skeleton variant="text" className="h-8 w-1/3 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton variant="rectangular" className="h-64 rounded-xl" />
                <Skeleton variant="rectangular" className="h-96 rounded-xl" />
              </div>
              <div className="space-y-6">
                <Skeleton variant="rectangular" className="h-48 rounded-xl" />
                <Skeleton variant="rectangular" className="h-32 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!userProfile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
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
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              프로필을 불러올 수 없습니다
            </h2>
            <p className="text-gray-600 mb-4">잠시 후 다시 시도해주세요.</p>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    //TODO
    // <ProtectedRoute>
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* 프로필 이미지 */}
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.nickname}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  userProfile.nickname.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userProfile.nickname}
                </h1>
                <p className="text-gray-600 mb-1">{userProfile.email}</p>
                {userProfile.location &&
                  userProfile.preferences.showLocation && (
                    <p className="text-gray-500 text-sm flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      {userProfile.location}
                    </p>
                  )}
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(userProfile.joinedAt).toLocaleDateString("ko-KR")}{" "}
                  가입
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                프로필 편집
              </Button>
              <Button
                variant="gradient"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m0 0V7a2 2 0 012-2m-2 2a2 2 0 002-2M9 7a2 2 0 012-2m-2 2a2 2 0 002-2"
                  />
                </svg>
                비밀번호 변경
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-6">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {userProfile.stats.bookmarksCount}
                </div>
                <div className="text-sm text-gray-600">북마크</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {userProfile.stats.visitedCount}
                </div>
                <div className="text-sm text-gray-600">방문 완료</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {userProfile.stats.reviewsCount}
                </div>
                <div className="text-sm text-gray-600">리뷰</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {userProfile.stats.totalTripDays}
                </div>
                <div className="text-sm text-gray-600">여행일</div>
              </Card>
            </div>

            {/* 프로필 편집 */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>프로필 편집</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="닉네임"
                    value={editForm.nickname}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        nickname: e.target.value,
                      }))
                    }
                    placeholder="닉네임을 입력하세요"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="자기소개를 입력하세요"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <Input
                    label="위치"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="위치를 입력하세요"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      선호 언어
                    </label>
                    <select
                      value={editForm.preferredLanguage}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          preferredLanguage: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveProfile} className="flex-1">
                      저장
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      취소
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 최근 활동 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/places/${activity.placeId}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {activity.placeName}
                          </Link>
                          {activity.rating && (
                            <div className="flex items-center text-yellow-500">
                              <svg
                                className="w-4 h-4 fill-current"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm ml-1">
                                {activity.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/bookmarks">전체 활동 보기</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 자기소개 */}
            <Card>
              <CardHeader>
                <CardTitle>자기소개</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {userProfile.bio || "아직 자기소개가 작성되지 않았습니다."}
                </p>
              </CardContent>
            </Card>

            {/* 빠른 액션 */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 액션</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/bookmarks">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    내 북마크
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/search">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    새 장소 찾기
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/categories">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14-7l-7 7-7-7m14 18l-7-7-7 7"
                      />
                    </svg>
                    카테고리 둘러보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="비밀번호 변경"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="현재 비밀번호"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            placeholder="현재 비밀번호를 입력하세요"
          />

          <Input
            label="새 비밀번호"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            placeholder="새 비밀번호를 입력하세요"
          />

          <Input
            label="새 비밀번호 확인"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="새 비밀번호를 다시 입력하세요"
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
              className="flex-1"
            >
              변경
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    // </ProtectedRoute>
  );
}
