"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

// 기존 패턴 활용한 타입 정의
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  tags: string[];
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  availability?: string;
}

export default function HelpPage() {
  const t = useTranslations("Help");
  const params = useParams();
  const locale = params.locale as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [faqItems, setFAQItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<FAQItem[]>([]);

  // FAQ 데이터 로드
  useEffect(() => {
    const loadFAQData = async () => {
      setIsLoading(true);
      try {
        // API 호출 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockFAQs: FAQItem[] = [
          {
            id: "1",
            question: t("signupQuestion"),
            answer: t("signupAnswer"),
            category: "account",
            helpful: 45,
            tags: [t("signupTag"), t("accountTag"), t("socialLoginTag")],
          },
          {
            id: "2",
            question: t("bookmarkQuestion"),
            answer: t("bookmarkAnswer"),
            category: "features",
            helpful: 32,
            tags: [t("bookmarkTag"), t("saveTag"), t("folderTag")],
          },
          {
            id: "3",
            question: t("crowdQuestion"),
            answer: t("crowdAnswer"),
            category: "features",
            helpful: 28,
            tags: [t("crowdTag"), t("realtimeTag"), t("aiTag")],
          },
          {
            id: "4",
            question: t("languageQuestion"),
            answer: t("languageAnswer"),
            category: "settings",
            helpful: 19,
            tags: [t("languageTag"), t("settingsTag"), t("multilingualTag")],
          },
          {
            id: "5",
            question: t("privacyQuestion"),
            answer: t("privacyAnswer"),
            category: "privacy",
            helpful: 41,
            tags: [t("personalInfoTag"), t("securityTag"), t("gdprTag")],
          },
          {
            id: "6",
            question: t("offlineQuestion"),
            answer: t("offlineAnswer"),
            category: "features",
            helpful: 15,
            tags: [t("offlineTag"), t("downloadTag"), t("featureTag")],
          },
        ];

        setFAQItems(mockFAQs);
        setSearchResults(mockFAQs);
      } catch (error) {
        console.error(t("faqLoadError"), error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQData();
  }, [t]);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = faqItems;

    // 카테고리 필터
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setSearchResults(filtered);
  }, [searchQuery, selectedCategory, faqItems]);

  // FAQ 도움됨 투표
  const handleHelpfulVote = async (faqId: string, isHelpful: boolean) => {
    try {
      await fetch(`/api/faq/${faqId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful: isHelpful }),
      });

      // 로컬 상태 업데이트
      setFAQItems((prev) =>
        prev.map((item) =>
          item.id === faqId
            ? { ...item, helpful: item.helpful + (isHelpful ? 1 : -1) }
            : item
        )
      );
    } catch (error) {
      console.error(t("voteError"), error);
    }
  };

  // 카테고리 정의
  const helpCategories: HelpCategory[] = [
    {
      id: "all",
      name: t("allCategories"),
      description: t("allCategoriesDesc"),
      count: faqItems.length,
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      id: "account",
      name: t("accountCategory"),
      description: t("accountCategoryDesc"),
      count: faqItems.filter((item) => item.category === "account").length,
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
      id: "features",
      name: t("featuresCategory"),
      description: t("featuresCategoryDesc"),
      count: faqItems.filter((item) => item.category === "features").length,
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      name: t("settingsCategory"),
      description: t("settingsCategoryDesc"),
      count: faqItems.filter((item) => item.category === "settings").length,
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
    {
      id: "privacy",
      name: t("privacyCategory"),
      description: t("privacyCategoryDesc"),
      count: faqItems.filter((item) => item.category === "privacy").length,
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
  ];

  // 연락처 옵션
  const contactOptions: ContactOption[] = [
    {
      id: "email",
      title: t("emailSupport"),
      description: t("emailSupportDesc"),
      action: "mailto:support@travelkorea.com",
      availability: t("emailAvailability"),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "chat",
      title: t("liveChat"),
      description: t("liveChatDesc"),
      action: "chat",
      availability: t("chatAvailability"),
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
    },
    {
      id: "phone",
      title: t("phoneSupport"),
      description: t("phoneSupportDesc"),
      action: "tel:+82-2-1234-5678",
      availability: t("phoneAvailability"),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("helpCenter")}
          </h1>
          <p className="text-xl text-gray-600 mb-8">{t("helpSubtitle")}</p>

          {/* 검색창 */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
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
            </div>
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-4 text-lg"
            />
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {helpCategories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                {category.icon}
                <span>{category.name}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ 목록 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t("frequentlyAsked")}
                  <span className="text-sm font-normal text-gray-500">
                    {searchResults.length}
                    {t("resultsCount")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        className="h-16"
                      />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8 7.962 7.962 0 014.291 1.291M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("noResults")}
                    </h3>
                    <p className="text-gray-500">{t("noResultsDesc")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((faq) => (
                      <div
                        key={faq.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <button
                          onClick={() =>
                            setExpandedFAQ(
                              expandedFAQ === faq.id ? null : faq.id
                            )
                          }
                          className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {faq.question}
                            </h3>
                            <svg
                              className={cn(
                                "w-5 h-5 text-gray-500 transition-transform",
                                expandedFAQ === faq.id && "rotate-180"
                              )}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </button>

                        {expandedFAQ === faq.id && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <p className="text-gray-700 mb-4">{faq.answer}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {faq.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  {t("wasHelpful")}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleHelpfulVote(faq.id, true)
                                  }
                                  className="text-green-600 hover:bg-green-50"
                                >
                                  👍 {faq.helpful}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleHelpfulVote(faq.id, false)
                                  }
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  👎
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 연락처 및 추가 도움 */}
          <div className="space-y-6">
            {/* 빠른 도움말 */}
            <Card>
              <CardHeader>
                <CardTitle>{t("quickHelp")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link
                    href="/tutorial"
                    className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{t("tutorial")}</div>
                      <div className="text-sm text-gray-500">
                        {t("tutorialDesc")}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/guide"
                    className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{t("userGuide")}</div>
                      <div className="text-sm text-gray-500">
                        {t("userGuideDesc")}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/api-docs"
                    className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{t("apiDocs")}</div>
                      <div className="text-sm text-gray-500">
                        {t("apiDocsDesc")}
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 연락처 */}
            <Card>
              <CardHeader>
                <CardTitle>{t("contactUs")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactOptions.map((option) => (
                    <div key={option.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {option.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </p>
                          {option.availability && (
                            <p className="text-xs text-gray-500 mt-2">
                              {option.availability}
                            </p>
                          )}
                          <Button
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                              if (
                                option.action.startsWith("mailto:") ||
                                option.action.startsWith("tel:")
                              ) {
                                window.location.href = option.action;
                              } else if (option.action === "chat") {
                                console.log(t("chatAction"));
                              }
                            }}
                          >
                            {option.id === "email"
                              ? t("sendEmail")
                              : option.id === "chat"
                              ? t("startChat")
                              : t("call")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 피드백 */}
            <Card>
              <CardHeader>
                <CardTitle>{t("feedback")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t("feedbackDesc")}
                </p>
                <Button className="w-full" asChild>
                  <Link href="/feedback">{t("sendFeedback")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
