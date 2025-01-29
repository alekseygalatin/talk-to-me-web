import { jwtDecode } from 'jwt-decode';
import { Auth } from "aws-amplify";

const TOKEN_KEY = "idToken";

interface TokenPayload {
  userId: string;
  exp: number; 
  [key: string]: any;
}

class AuthService {

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static refreshToken(): void {
    console.log("refreshToken");
    try {
      Auth.currentSession().then((session => {
        const accessToken = session.getAccessToken();
        const token = accessToken.getJwtToken();
        this.storeToken(token);
      }));
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  static storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static decodeToken(token?: string): TokenPayload | null {
    if (!token)
      token = this.getToken()!;
    if (!token) return null;

    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  static clearToken(): void {
    console.log("clearToken");
    localStorage.removeItem(TOKEN_KEY);
  }

}

export default AuthService;
