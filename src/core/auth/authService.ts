import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = "idToken"; 

interface TokenPayload {
  userId: string;
  exp: number; 
  [key: string]: any;
}

class AuthService {

  static storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static decodeToken(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const decodedToken = this.decodeToken();
    if (!decodedToken) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp > currentTime;
  }

  static getUserId(): string | null {
    const decodedToken = this.decodeToken();
    return decodedToken?.sub || null;
  }

  static clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export default AuthService;
