import { useTuyau } from "./useTuyau";

interface User {
  id: number;
  email: string;
  fullName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const useAuth = () => {
  const tuyau = useTuyau();
  const token = useCookie<string | null>("auth_token", {
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
  const user = useState<User | null>("auth_user", () => null);

  const login = async (email: string, password: string) => {
    const response = await tuyau.auth.login.$post({
      email,
      password,
    });

    const data = response.data as AuthResponse;
    token.value = data.token;
    user.value = data.user;

    return data;
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string,
  ) => {
    const response = await tuyau.auth.register.$post({
      email,
      password,
      fullName,
    });

    const data = response.data as AuthResponse;
    token.value = data.token;
    user.value = data.user;

    return data;
  };

  const logout = async () => {
    if (!token.value) return;

    try {
      await tuyau.auth.logout.$post(undefined, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
    } finally {
      token.value = null;
      user.value = null;
    }
  };

  const fetchUser = async () => {
    if (!token.value) {
      user.value = null;
      return null;
    }

    try {
      const response = await tuyau.auth.me.$get({
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      const data = response.data as { user: User };
      user.value = data.user;
      return data.user;
    } catch (error) {
      token.value = null;
      user.value = null;
      return null;
    }
  };

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  return {
    user,
    token,
    login,
    register,
    logout,
    fetchUser,
    isAuthenticated,
  };
};
