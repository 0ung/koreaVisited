export interface Place {
  id: string;
  name: { ko: string; en: string; ja: string };
  address: { ko: string; en: string; ja: string };
  lat: number;
  lon: number;
  category_std: string;
  rating_avg: number;
  review_count: number;
  main_image_urls: string[];
  recommendation_score: number;
  crowd_index?: number;
  distance?: number;
  price_level?: number;
  platform_data: {
    kakao?: { available: boolean; rating: number; review_count: number };
    naver?: { available: boolean; rating: number; review_count: number };
    google?: { available: boolean; rating: number; review_count: number };
  };
  data_quality_score: number;
  last_updated: string;
  ugc_summary?: {
    positive_count: number;
    negative_count: number;
    recent_tags: string[];
  };
}

export interface CategoryStats {
  category: string;
  count: number;
  avg_rating: number;
  icon: string;
  color: string;
}

export interface CategoryIconInfo {
  icon: string;
  color: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export interface SearchFilters {
  category: string;
  location: string;
  rating: number;
  priceLevel: string;
  distance: string;
  openNow: boolean;
  dataQuality: number;
  platformCount: number;
  crowdLevel: string;
}

export interface CategoryInfo {
  id: string;
  name: { ko: string; en: string; ja: string };
  description?: { ko: string; en: string; ja: string };
  icon?: string;
  gradient?: string;
  color?: string;
  subcategories?: Array<{
    id: string;
    name: { ko: string; en: string; ja: string };
    icon: string;
    place_count: number;
  }>;
}

export interface SubCategory {
  id: string;
  name: { ko: string; en: string; ja: string };
  icon: string;
  place_count: number;
}
