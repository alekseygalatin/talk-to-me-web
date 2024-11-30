import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
    const token = localStorage.getItem('idToken');

    useEffect(() => {
      if (!token || isTokenExpired(token)) {
        navigate('/login'); // Redirect to login if not authenticated
      }
    }, [token, navigate]);

    return <Component {...(props as T)} />;
  };
} 