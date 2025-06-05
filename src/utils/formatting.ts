// utils/formatting.ts
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  return phone;
};

export const formatCurrency = (
  amount: number,
  currency: string = "KRW",
  locale: string = "ko-KR"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDistance = (
  meters: number,
  locale: string = "ko"
): string => {
  if (meters < 1000) {
    return locale === "ko"
      ? `${Math.round(meters)}m`
      : `${Math.round(meters)}m`;
  }

  const km = meters / 1000;
  if (km < 10) {
    return locale === "ko" ? `${km.toFixed(1)}km` : `${km.toFixed(1)}km`;
  }

  return locale === "ko" ? `${Math.round(km)}km` : `${Math.round(km)}km`;
};

export const formatRelativeTime = (
  date: Date | string,
  locale: string = "ko"
): string => {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return locale === "ko" ? "방금 전" : "just now";
  }

  if (diffMinutes < 60) {
    return locale === "ko" ? `${diffMinutes}분 전` : `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return locale === "ko" ? `${diffHours}시간 전` : `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return locale === "ko" ? `${diffDays}일 전` : `${diffDays}d ago`;
  }

  return targetDate.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US");
};
