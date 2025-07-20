import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Auth } from 'aws-amplify';

interface JwtPayload {
  exp: number;
}

const isTokenExpired = (token: string) => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Invalid token:', error);
    return true;
  }
};

export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return (props: T) => {
    const navigate = useNavigate();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const session = await Auth.currentSession();
          const token = session.getAccessToken().getJwtToken();

          if (!token || isTokenExpired(token)) {
            console.error("Token expired or missing");
            navigate("/login");
          }

        } catch (error) {
          console.error("User is not authenticated:", error);
          navigate("/login");
        }
      };

      checkAuth();
    }, [navigate]);

    return <Component {...(props as T)} />;
  };
} 