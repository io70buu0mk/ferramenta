
import { useRegister } from "./useRegister";
import { useLogin } from "./useLogin";

export function useAuth() {
  const register = useRegister();
  const login = useLogin();

  return {
    loading: register.loading || login.loading,
    error: register.error || login.error,
    handleRegister: register.handleRegister,
    handleLogin: login.handleLogin,
    resetPassword: login.resetPassword,
    setError: (error: string | null) => {
      if (register.setError) register.setError(error);
      if (login.setError) login.setError(error);
    }
  };
}
