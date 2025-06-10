// src/components/home/HowItWorksSection.tsx
"use client";

import { useTranslations } from "next-intl";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export function HowItWorksSection() {
  const homeT = useTranslations("Home");

  const steps: Step[] = [
    {
      number: "01",
      title: homeT("step1") || "원하는 장소를 검색하세요",
      description:
        homeT("step1Description") ||
        "카테고리별로 찾거나 키워드로 검색할 수 있습니다",
      icon: "🔍",
    },
    {
      number: "02",
      title: homeT("step2") || "실시간 정보와 리뷰를 확인하세요",
      description:
        homeT("step2Description") ||
        "3개 플랫폼의 정보와 혼잡도를 한번에 볼 수 있습니다",
      icon: "📊",
    },
    {
      number: "03",
      title: homeT("step3") || "나만의 여행 계획을 세워보세요",
      description:
        homeT("step3Description") ||
        "북마크와 폴더로 나만의 여행 리스트를 만들어보세요",
      icon: "📋",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            💡 {homeT("howItWorks") || "이용 방법"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            간단한 3단계로 완벽한 여행을 계획하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-4xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {step.icon}
                </div>
                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600 border-4 border-blue-100 shadow-lg group-hover:scale-110 transition-all duration-300">
                  {step.number}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
