import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNotAuthenticatedUser = () => {
    setIsAuthenticated(false);
    if (location.pathname !== "/login") 
      navigate("/login", { replace: true });
  } 

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authUser = await Auth.currentAuthenticatedUser();
        if (authUser) {
          setIsAuthenticated(true);
        } else {
            handleNotAuthenticatedUser();
        }
      } catch {
        handleNotAuthenticatedUser();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate, location.pathname]);

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={{ loading, isAuthenticated }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
