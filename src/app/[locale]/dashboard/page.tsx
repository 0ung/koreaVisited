"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

// 기존 패턴 활용한 타입 정의
interface DashboardStats {
  places: {
    total: number;
    todayAdded: number;
    needsReview: number;
    avgRating: number;
  };
  etl: {
    lastRun: string;
    status: "running" | "completed" | "failed";
    processed: number;
    errors: number;
  };
  api: {
    kakaoErrorRate: number;
    naverErrorRate: number;
    googleErrorRate: number;
    aiErrorRate: number;
  };
  users: {
    total: number;
    active: number;
    newToday: number;
    retention: number;
  };
  ugc: {
    total: number;
    todayAdded: number;
    analyzed: number;
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
}

interface SystemAlert {
  id: string;
  level: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface ETLJob {
  id: string;
  type: "places" | "ugc" | "crowd" | "ai";
  status: "pending" | "running" | "completed" | "failed";
  startTime: string;
  endTime?: string;
  progress: number;
  errors: string[];
}

export default function AdminDashboard() {
  const t = useTranslations("AdminDashboard");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [etlJobs, setETLJobs] = useState<ETLJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [showETLModal, setShowETLModal] = useState(false);

  // 대시보드 데이터 로드
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // API 호출 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const mockStats: DashboardStats = {
          places: {
            total: 15847,
            todayAdded: 23,
            needsReview: 12,
            avgRating: 4.2,
          },
          etl: {
            lastRun: "2025-06-08T14:30:00Z",
            status: "completed",
            processed: 1250,
            errors: 3,
          },
          api: {
            kakaoErrorRate: 0.2,
            naverErrorRate: 0.1,
            googleErrorRate: 0.5,
            aiErrorRate: 1.2,
          },
          users: {
            total: 8342,
            active: 1567,
            newToday: 45,
            retention: 73.4,
          },
          ugc: {
            total: 23891,
            todayAdded: 189,
            analyzed: 22456,
            sentiment: {
              positive: 65.2,
              neutral: 28.1,
              negative: 6.7,
            },
          },
        };

        const mockAlerts: SystemAlert[] = [
          {
            id: "1",
            level: "warning",
            title: "혼잡도 예측 이상치 감지",
            message:
              "강남역 일대 혼잡도가 평소보다 250% 높게 측정되고 있습니다.",
            timestamp: "2025-06-08T15:45:00Z",
            resolved: false,
          },
          {
            id: "2",
            level: "error",
            title: "Google Places API 오류율 증가",
            message:
              "지난 1시간 동안 Google Places API 오류율이 5%를 초과했습니다.",
            timestamp: "2025-06-08T15:20:00Z",
            resolved: false,
          },
          {
            id: "3",
            level: "info",
            title: "ETL 프로세스 완료",
            message: "오늘 14:30 ETL 프로세스가 성공적으로 완료되었습니다.",
            timestamp: "2025-06-08T14:30:00Z",
            resolved: true,
          },
        ];

        const mockETLJobs: ETLJob[] = [
          {
            id: "job-1",
            type: "places",
            status: "completed",
            startTime: "2025-06-08T14:00:00Z",
            endTime: "2025-06-08T14:30:00Z",
            progress: 100,
            errors: [],
          },
          {
            id: "job-2",
            type: "ugc",
            status: "running",
            startTime: "2025-06-08T15:00:00Z",
            progress: 67,
            errors: [],
          },
          {
            id: "job-3",
            type: "ai",
            status: "pending",
            startTime: "2025-06-08T16:00:00Z",
            progress: 0,
            errors: [],
          },
        ];

        setStats(mockStats);
        setAlerts(mockAlerts);
        setETLJobs(mockETLJobs);
      } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // 실시간 업데이트 (30초마다)
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ETL 작업 수동 실행
  const triggerETLJob = async (type: string) => {
    try {
      await fetch(`/api/admin/etl/${type}`, { method: "POST" });
      // 작업 목록 새로고침
      const newJob: ETLJob = {
        id: `job-${Date.now()}`,
        type: type as any,
        status: "pending",
        startTime: new Date().toISOString(),
        progress: 0,
        errors: [],
      };
      setETLJobs((prev) => [...prev, newJob]);
    } catch (error) {
      console.error("ETL 작업 실행 실패:", error);
    }
  };

  // 알림 해결 처리
  const resolveAlert = async (alertId: string) => {
    try {
      await fetch(`/api/admin/alerts/${alertId}/resolve`, { method: "PUT" });
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, resolved: true } : alert
        )
      );
    } catch (error) {
      console.error("알림 해결 실패:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "running":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case "critical":
        return "border-red-500 bg-red-50";
      case "error":
        return "border-red-400 bg-red-50";
      case "warning":
        return "border-yellow-400 bg-yellow-50";
      case "info":
        return "border-blue-400 bg-blue-50";
      default:
        return "border-gray-400 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton variant="rectangular" className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton variant="rectangular" className="h-96" />
            <Skeleton variant="rectangular" className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">
            {t("subtitle")} • 마지막 업데이트: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* 주요 메트릭 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 장소 통계 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">총 장소 수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.places.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    오늘 +{stats.places.todayAdded}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 사용자 통계 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">활성 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.users.active.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    신규 +{stats.users.newToday}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* UGC 통계 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">UGC 콘텐츠</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.ugc.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-600">
                    오늘 +{stats.ugc.todayAdded}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API 상태 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">API 평균 오류율</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(
                      (stats.api.kakaoErrorRate +
                        stats.api.naverErrorRate +
                        stats.api.googleErrorRate +
                        stats.api.aiErrorRate) /
                      4
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-sm text-orange-600">
                    AI: {stats.api.aiErrorRate}%
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ETL 상태 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>ETL 프로세스 상태</CardTitle>
              <Button size="sm" onClick={() => setShowETLModal(true)}>
                작업 관리
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">마지막 실행</p>
                    <p className="text-sm text-gray-600">
                      {new Date(stats.etl.lastRun).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      getStatusColor(stats.etl.status)
                    )}
                  >
                    {stats.etl.status === "completed"
                      ? "완료"
                      : stats.etl.status === "running"
                      ? "실행중"
                      : "실패"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.etl.processed}
                    </p>
                    <p className="text-sm text-gray-600">처리됨</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {stats.etl.errors}
                    </p>
                    <p className="text-sm text-gray-600">오류</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {etlJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            getStatusColor(job.status)
                          )}
                        >
                          {job.type.toUpperCase()}
                        </span>
                        <span className="text-sm">
                          {job.status === "running"
                            ? "실행중"
                            : job.status === "completed"
                            ? "완료"
                            : job.status === "failed"
                            ? "실패"
                            : "대기중"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {job.progress}%
                        </div>
                        {job.status === "running" && (
                          <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 시스템 알림 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                시스템 알림
                <span className="text-sm font-normal text-gray-500">
                  {alerts.filter((a) => !a.resolved).length}개 미해결
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    알림이 없습니다
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-4 border-l-4 rounded-r cursor-pointer hover:bg-gray-50 transition-colors",
                        getAlertColor(alert.level),
                        alert.resolved && "opacity-50"
                      )}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {alert.title}
                            </h4>
                            {!alert.resolved && (
                              <span
                                className={cn(
                                  "px-2 py-1 text-xs rounded-full",
                                  alert.level === "critical"
                                    ? "bg-red-100 text-red-800"
                                    : alert.level === "error"
                                    ? "bg-red-100 text-red-700"
                                    : alert.level === "warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                )}
                              >
                                {alert.level}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveAlert(alert.id);
                            }}
                            className="ml-2"
                          >
                            해결
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API 상태 상세 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API 모니터링</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "카카오 API",
                  rate: stats.api.kakaoErrorRate,
                  color: "yellow",
                },
                {
                  name: "네이버 API",
                  rate: stats.api.naverErrorRate,
                  color: "green",
                },
                {
                  name: "구글 API",
                  rate: stats.api.googleErrorRate,
                  color: "blue",
                },
                {
                  name: "AI API",
                  rate: stats.api.aiErrorRate,
                  color: "purple",
                },
              ].map((api) => (
                <div
                  key={api.name}
                  className="text-center p-4 border rounded-lg"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{api.name}</h4>
                  <div
                    className={cn(
                      "text-3xl font-bold mb-2",
                      api.rate < 1
                        ? "text-green-600"
                        : api.rate < 3
                        ? "text-yellow-600"
                        : "text-red-600"
                    )}
                  >
                    {api.rate}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        api.rate < 1
                          ? "bg-green-500"
                          : api.rate < 3
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      )}
                      style={{ width: `${Math.min(api.rate, 10) * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">오류율</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ETL 작업 관리 모달 */}
      <Modal
        isOpen={showETLModal}
        onClose={() => setShowETLModal(false)}
        title="ETL 작업 관리"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                type: "places",
                name: "장소 데이터 수집",
                desc: "카카오/네이버/구글 API 호출",
              },
              {
                type: "ugc",
                name: "UGC 데이터 수집",
                desc: "소셜미디어 크롤링",
              },
              { type: "ai", name: "AI 분석", desc: "감정분석 및 추천 생성" },
              {
                type: "crowd",
                name: "혼잡도 업데이트",
                desc: "실시간 혼잡도 계산",
              },
            ].map((job) => (
              <Card key={job.type}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{job.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{job.desc}</p>
                  <Button
                    size="sm"
                    onClick={() => triggerETLJob(job.type)}
                    className="w-full"
                  >
                    실행
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h4 className="font-medium mb-3">작업 진행 상황</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {etlJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <span className="font-medium">
                      {job.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(job.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs",
                        getStatusColor(job.status)
                      )}
                    >
                      {job.status}
                    </span>
                    <span className="text-sm font-medium">{job.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 알림 상세 모달 */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={selectedAlert.title}
          size="md"
        >
          <div className="space-y-4">
            <div
              className={cn(
                "p-4 border-l-4 rounded-r",
                getAlertColor(selectedAlert.level)
              )}
            >
              <p className="text-gray-700">{selectedAlert.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                발생 시간: {new Date(selectedAlert.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setSelectedAlert(null)}
                className="flex-1"
              >
                닫기
              </Button>
              {!selectedAlert.resolved && (
                <Button
                  onClick={() => {
                    resolveAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="flex-1"
                >
                  해결하기
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
