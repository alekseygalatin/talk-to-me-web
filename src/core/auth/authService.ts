import { jwtDecode } from 'jwt-decode';
import { Amplify } from "aws-amplify";

const TOKEN_KEY = "idToken";
const EXPIRES_AT = "expiresAt";  

interface TokenPayload {
  userId: string;
  exp: number; 
  [key: string]: any;
}

class AuthService {

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static refreshToken = async (): Promise<string | null> => {
    console.log("refreshToken");
    try {
      const session = await Amplify.Auth.fetchSession();
      const accessToken = session.tokens?.accessToken.toString();

      console.log("aud: " + session.tokens?.accessToken.payload.aud);
      console.log("iis: " + session.tokens?.accessToken.payload.iss);

      if (accessToken) {
        this.storeToken(accessToken);
        return accessToken;
      }

      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  static storeToken(token: string): void {
    const decodedToken = this.decodeToken(token);
    if (decodedToken) {
      const expiresAt = decodedToken.exp * 1000; // Convert to ms
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EXPIRES_AT, expiresAt.toString());
    }
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
    localStorage.removeItem(EXPIRES_AT);
  }

}

export default AuthService;
