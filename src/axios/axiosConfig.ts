// axios/axiosConfig.ts - 스마트한 세션 기반
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_SPRING_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  withCredentials: true, // JSESSIONID 쿠키 자동 전송/수신
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 스마트한 401 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // /auth/me나 /auth/login 요청이 아닌 경우에만 리다이렉트
      const isAuthCheck = error.config?.url?.includes("/auth/me");
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      const isPublicRoute = error.config?.url?.includes("/auth/");

      if (!isAuthCheck && !isLoginRequest && !isPublicRoute) {
        // 인증이 필요한 API 호출에서만 리다이렉트
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const locale = currentPath.split("/")[1] || "ko";

          // 이미 로그인 페이지에 있다면 리다이렉트하지 않음
          if (!currentPath.includes("/login")) {
            window.location.href = `/${locale}/login`;
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
