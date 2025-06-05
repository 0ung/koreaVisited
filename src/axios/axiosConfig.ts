import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_SPRING_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  withCredentials: true, // 쿠키 자동 전송
});

// 요청 인터셉터 - accessToken 자동 추가
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 401 시 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Spring Boot refresh 엔드포인트 호출
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SPRING_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        // localStorage에 새 토큰 저장
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // refresh 실패 시 로그아웃
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          document.cookie =
            "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
