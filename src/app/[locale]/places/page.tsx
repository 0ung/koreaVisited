"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";
import { formatRelativeTime, formatDistance } from "@/utils/formatting";
import { storage } from "@/utils/storage";
import ImageGallery from "@/components/ImageGallery";
import CrowdGauge from "@/components/CrowdGauge";
import UGCTips from "@/components/UGCTips";

// 타입 정의
interface PlaceDetail {
  id: string;
  name: {
    ko: string;
    en: string;
    ja: string;
  };
  address: {
    ko: string;
    en: string;
    ja: string;
  };
  lat: number;
  lon: number;
  tel: string;
  opening_hours: string;
  category_std: string;
  rating_avg: number;
  review_count: number;
  main_image_urls: string[];
  recommendation_score: number;
  crowd_index: number;
  last_updated: string;
  website?: string;
  price_level?: number;
  features: string[];
  ai_recommendations: {
    recommendation_phrase: string;
    weather_tips?: string;
    time_tips?: string;
    crowd_tips?: string;
  };
  ugc_tips: UGCTip[];
}

interface UGCTip {
  id: string;
  tip_summary: string;
  sentiment_score: number;
  tags: string[];
  images: string[];
  author: string;
  author_score: number;
  created_at: string;
  quality_score: number;
}

interface MapProvider {
  id: 'kakao' | 'naver' | 'google';
  name: string;
  icon: string;
  color: string;
}

export default function PlaceDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const placeId = params.id as string;

  // 상태 관리
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedMapProvider, setSelectedMapProvider] = useState<MapProvider['id']>('kakao');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 지도 제공업체 설정
  const mapProviders: MapProvider[] = [
    { id: 'kakao', name: '카카오맵', icon: '🗺️', color: 'bg-yellow-500' },
    { id: 'naver', name: '네이버지도', icon: '🧭', color: 'bg-green-500' },
    { id: 'google', name: '구글맵', icon: '🌏', color: 'bg-blue-500' },
  ];

  // 현재 언어에 맞는 텍스트 가져오기
  const getLocalizedText = (textObj: { ko: string; en: string; ja: string }) => {
    return textObj[locale as keyof typeof textObj] || textObj.ko;
  };

  // 장소 상세 정보 로드
  useEffect(() => {
    const loadPlaceDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 실제로는 API 호출: /api/places/${placeId}?locale=${locale}
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 목업 데이터
        const mockPlace: PlaceDetail = {
          id: placeId,
          name: {
            ko: '부산 감천문화마을',
            en: 'Gamcheon Culture Village',
            ja: '釜山甘川文化村'
          },
          address: {
            ko: '부산광역시 사하구 감내2로 203',
            en: '203 Gamnae 2-ro, Saha-gu, Busan, South Korea',
            ja: '韓国釜山広域市沙下区甘内2路203'
          },
          lat: 35.0976,
          lon: 129.0092,
          tel: '051-204-1444',
          opening_hours: '09:00-18:00',
          category_std: 'attractions',
          rating_avg: 4.5,
          review_count: 2847,
          main_image_urls: [
            '/images/gamcheon-1.jpg',
            '/images/gamcheon-2.jpg',
            '/images/gamcheon-3.jpg',
            '/images/gamcheon-4.jpg'
          ],
          recommendation_score: 9.2,
          crowd_index: 65,
          last_updated: new Date().toISOString(),
          website: 'http://www.gamcheon.or.kr',
          price_level: 1,
          features: ['포토존', '문화체험', '예술작품', '카페', '기념품샵', '전망대'],
          ai_recommendations: {
            recommendation_phrase: locale === 'ko' 
              ? '오늘 같은 맑은 날씨에는 골목골목 숨어있는 예술작품을 찾아보세요. 특히 오후 4시경 석양이 질 때 마을 전체가 황금빛으로 물들어 환상적인 사진을 남길 수 있어요.'
              : locale === 'en'
              ? 'On a clear day like today, explore the hidden artworks in every alley. The entire village turns golden during sunset around 4 PM, perfect for amazing photos.'
              : '今日のような晴れた日は、路地裏に隠れている芸術作品を探してみてください。特に午後4時頃の夕日の時間には、村全体が黄金色に染まって幻想的な写真が撮れます。',
            weather_tips: '우천시에는 계단이 미끄러우니 주의하세요',
            time_tips: '오전 10시-오후 4시 사이가 가장 좋은 조명입니다',
            crowd_tips: '주말 오전이 가장 한적합니다'
          },
          ugc_tips: [
            {
              id: '1',
              tip_summary: locale === 'ko'
                ? '입구에서 지도를 꼭 받으세요! 숨은 포토존이 정말 많아요. 특히 어린왕자 조형물 근처가 인생샷 명소입니다.'
                : 'Make sure to get a map at the entrance! There are so many hidden photo spots. The Little Prince sculpture area is perfect for photos.',
              sentiment_score: 0.9,
              tags: ['지도', '포토존', '어린왕자'],
              images: ['/images/tip-1.jpg'],
              author: '여행러버',
              author_score: 4.8,
              created_at: '2024-03-15T10:30:00Z',
              quality_score: 0.85
            },
            {
              id: '2',
              tip_summary: locale === 'ko'
                ? '계단이 많아서 편한 신발 필수! 중간중간 쉴 수 있는 카페들도 있으니 천천히 둘러보세요.'
                : 'Comfortable shoes are essential due to many stairs! There are cafes along the way to rest.',
              sentiment_score: 0.8,
              tags: ['신발', '계단', '카페'],
              images: [],
              author: '부산토박이',
              author_score: 4.6,
              created_at: '2024-03-10T14:20:00Z',
              quality_score: 0.78
            },
            {
              id: '3',
              tip_summary: locale === 'ko'
                ? '낮에도 예쁘지만 야경도 정말 멋져요! 다만 밤에는 조명이 어두운 구간이 있어서 조심하세요.'
                : 'Beautiful during the day, but the night view is amazing too! Be careful of dimly lit areas at night.',
              sentiment_score: 0.85,
              tags: ['야경', '조명', '밤'],
              images: ['/images/tip-3.jpg'],
              author: '사진작가김씨',
              author_score: 4.9,
              created_at: '2024-03-08T19:45:00Z',
              quality_score: 0.82
            }
          ]
        };

        setPlace(mockPlace);

        // 북마크 상태 체크
        const savedPlaces = storage.get<string[]>('savedPlaces', []);
        setIsSaved(savedPlaces.includes(placeId));

      } catch (err) {
        setError('장소 정보를 불러올 수 없습니다.');
        console.error('Place detail load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaceDetail();
  }, [placeId, locale]);

  // 북마크 토글
  const toggleBookmark = () => {
    const savedPlaces = storage.get<string[]>('savedPlaces', []);
    let newSavedPlaces: string[];

    if (isSaved) {
      newSavedPlaces = savedPlaces.filter(id => id !== placeId);
    } else {
      newSavedPlaces = [...savedPlaces, placeId];
    }

    storage.set('savedPlaces', newSavedPlaces);
    setIsSaved(!isSaved);
  };

  // 지도 링크 생성
  const getMapUrl = (provider: MapProvider['id']) => {
    if (!place) return '#';

    const { lat, lon, name } = place;
    const placeName = getLocalizedText(name);

    switch (provider) {
      case 'kakao':
        return `https://map.kakao.com/link/map/${placeName},${lat},${lon}`;
      case 'naver':
        return `https://map.naver.com/v5/search/${placeName}`;
      case 'google':
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      default:
        return '#';
    }
  };

  // 공유 기능
  const handleShare = async () => {
    const shareData = {
      title: place ? getLocalizedText(place.name) : '',
      text: place?.ai_recommendations.recommendation_phrase || '',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  // 혼잡도 상태
  const getCrowdStatus = (crowdIndex: number) => {
    if (crowdIndex <= 30) return { text: '여유', color: 'text-green-600 bg-green-100' };
    if (crowdIndex <= 70) return { text: '보통', color: 'text-yellow-600 bg-yellow-100' };
    return { text: '혼잡', color: 'text-red-600 bg-red-100' };
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <Skeleton variant="rectangular" className="h-80 mb-6 rounded-xl" />
          <Skeleton variant="text" className="h-8 mb-4 w-1/2" />
          <Skeleton variant="text" className="h-6 mb-6 w-3/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton variant="rectangular" className="h-48 rounded-xl" />
              <Skeleton variant="rectangular" className="h-64 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton variant="rectangular" className="h-32 rounded-xl" />
              <Skeleton variant="rectangular" className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">장소를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>이전으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const crowdStatus = getCrowdStatus(place.crowd_index);
  // const displayedTips = showAllTips ? place.ugc_tips : place.ugc_tips.slice(0, 3); // UGCTips 컴포넌트에서 처리

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* 뒤로가기 네비게이션 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              뒤로가기
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                aria-label="공유하기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </Button>

              <Button
                variant={isSaved ? "default" : "outline"}
                size="icon"
                onClick={toggleBookmark}
                aria-label={isSaved ? "북마크 해제" : "북마크 추가"}
              >
                <svg
                  className={cn("w-5 h-5", isSaved && "fill-current")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 메인 이미지 섹션 */}
        <div className="mb-6">
          <ImageGallery
            images={place.main_image_urls}
            alt={getLocalizedText(place.name)}
            className="h-80"
            showThumbnails={false}
            autoSlide={true}
          />
          
          {/* 이미지 위 오버레이 정보 */}
          <div className="relative -mt-20 z-10 mx-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getLocalizedText(place.name)}
              </h1>
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">{place.rating_avg}</span>
                  <span className="text-gray-500">({place.review_count.toLocaleString()}개 리뷰)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{getLocalizedText(place.address)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI 추천 섹션 */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  AI 맞춤 추천
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    추천도 {place.recommendation_score}/10
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-900 leading-relaxed text-lg">
                  {place.ai_recommendations.recommendation_phrase}
                </p>
                
                {/* 추가 팁들 */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">🌤️</span>
                      <span className="font-medium text-sm">날씨 팁</span>
                    </div>
                    <p className="text-sm text-gray-700">{place.ai_recommendations.weather_tips}</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">⏰</span>
                      <span className="font-medium text-sm">시간 팁</span>
                    </div>
                    <p className="text-sm text-gray-700">{place.ai_recommendations.time_tips}</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">👥</span>
                      <span className="font-medium text-sm">혼잡도 팁</span>
                    </div>
                    <p className="text-sm text-gray-700">{place.ai_recommendations.crowd_tips}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UGC 팁 섹션 */}
            <UGCTips
              tips={place.ugc_tips}
              maxVisible={3}
              showHeader={true}
              title="실제 방문자 꿀팁"
            />

            {/* 멀티맵 섹션 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  지도 및 길찾기
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 지도 제공업체 선택 */}
                  <div className="flex gap-2 mb-4">
                    {mapProviders.map((provider) => (
                      <Button
                        key={provider.id}
                        variant={selectedMapProvider === provider.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMapProvider(provider.id)}
                        className="flex items-center gap-2"
                      >
                        <span>{provider.icon}</span>
                        {provider.name}
                      </Button>
                    ))}
                  </div>

                  {/* 지도 영역 (실제로는 iframe이나 지도 API가 들어갈 자리) */}
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {mapProviders.find(p => p.id === selectedMapProvider)?.name} 연동
                      </h3>
                      <p className="text-gray-600 mb-4">
                        실제 서비스에서는 {mapProviders.find(p => p.id === selectedMapProvider)?.name}이 여기에 표시됩니다.
                      </p>
                    </div>
                    
                    {/* 지도 위 마커 표시 시뮬레이션 */}
                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-medium text-sm">{getLocalizedText(place.name)}</span>
                      </div>
                      <p className="text-xs text-gray-600">{getLocalizedText(place.address)}</p>
                    </div>
                  </div>

                  {/* 지도 액션 버튼들 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => window.open(getMapUrl(selectedMapProvider), '_blank')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {mapProviders.find(p => p.id === selectedMapProvider)?.name}에서 보기
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(`${place.lat}, ${place.lon}`);
                        // TODO: 토스트 알림 표시
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      좌표 복사
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const address = getLocalizedText(place.address);
                        navigator.clipboard.writeText(address);
                        // TODO: 토스트 알림 표시
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      주소 복사
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 실시간 혼잡도 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  실시간 혼잡도
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CrowdGauge
                  crowdIndex={place.crowd_index}
                  lastUpdated={place.last_updated}
                  size="lg"
                  showLabel={false}
                  showLastUpdated={true}
                  animated={true}
                />

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">현재 방문 적합도</span>
                    <span className="font-medium">
                      {place.crowd_index <= 30 ? '😊 최적' : place.crowd_index <= 70 ? '😐 보통' : '😅 비추'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">예상 대기시간</span>
                    <span className="font-medium">
                      {place.crowd_index <= 30 ? '없음' : place.crowd_index <= 70 ? '5-10분' : '15-20분'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card></div>
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="font-medium">전화번호</p>
                      <p className="text-gray-600">{place.tel}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">운영시간</p>
                      <p className="text-gray-600">{place.opening_hours}</p>
                    </div>
                  </div>

                  {place.website && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                      <div>
                        <p className="font-medium">웹사이트</p>
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          공식 홈페이지
                        </a>
                      </div>
                    </div>
                  )}

                  {place.price_level && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <div>
                        <p className="font-medium">가격대</p>
                        <p className="text-gray-600">
                          {'₩'.repeat(place.price_level)} 
                          <span className="ml-2 text-sm">
                            ({place.price_level === 1 ? '저렴' : place.price_level === 2 ? '보통' : place.price_level === 3 ? '비쌈' : '고급'})
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 편의시설 */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-medium mb-3">편의시설 & 특징</p>
                  <div className="flex flex-wrap gap-2">
                    {place.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 빠른 액션 */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  className="w-full"
                  onClick={() => window.open(`tel:${place.tel}`, '_self')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  전화하기
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(getMapUrl(selectedMapProvider), '_blank')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  길찾기
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShare}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  공유하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 공유 모달 */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="장소 공유하기"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-2">{getLocalizedText(place.name)}</h3>
            <p className="text-sm text-gray-600">이 장소를 친구들과 공유해보세요!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getLocalizedText(place.name))}&url=${encodeURIComponent(window.location.href)}`;
                window.open(url, '_blank');
              }}
            >
              🐦 트위터
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                window.open(url, '_blank');
              }}
            >
              📘 페이스북
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setIsShareModalOpen(false);
                // TODO: 토스트 알림 표시
              }}
              className="col-span-2"
            >
              🔗 링크 복사
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
}