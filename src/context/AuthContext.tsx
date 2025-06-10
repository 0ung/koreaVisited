// context/AuthContext.tsx - 개선된 세션 기반
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/axios/axiosConfig";

interface User {
  id: string;
  email: string;
  nickname: string;
  preferredLanguage: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  preferredLanguage: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 세션 확인 함수 - 에러 처리 개선
  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (error: any) {
      // 401은 정상적인 상황 (로그인 안됨)
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        // 네트워크 오류 등 다른 에러만 로깅
        console.error("인증 확인 중 오류:", error);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드 시 세션 확인
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        setUser(response.data);
      } else {
        throw new Error("로그인 실패");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("이메일 또는 비밀번호가 잘못되었습니다.");
      } else if (error.response?.status === 400) {
        throw new Error("입력 정보를 확인해주세요.");
      } else {
        throw new Error("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await api.post("/auth/signup", data);

      if (response.status === 201) {
        console.log("회원가입 성공");
      } else {
        throw new Error("회원가입 실패");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("이미 존재하는 이메일입니다.");
      } else if (error.response?.status === 422) {
        throw new Error("입력 정보를 확인해주세요.");
      } else {
        throw new Error("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
