
import { SERVER } from "../constants.ts";
import { TokenResponse } from "../interfaces/responses.ts";
import type { LoginData, RegisterData, User } from "../interfaces/user.ts";
import { Http } from "./http.ts";

export class AuthService {
  #http = new Http();

  async login(userLogin: LoginData): Promise<void> {
    const resp = await this.#http.post<TokenResponse, LoginData>(
      `${SERVER}/auth/login`,
      userLogin
    );
    localStorage.setItem("token", resp.accessToken);
  }

  /* Registra usuario */
  async register(userInfo: RegisterData): Promise<void> {
    await this.#http.post<User, RegisterData>(
      `${SERVER}/auth/register`,
      userInfo
    );
  }

  /* Comprueba si el token guardado sigue siendo válido */

  async checkToken(): Promise<void> {
    await this.#http.get(`${SERVER}/auth/validate`);
  }

  /* Elimina el token guardado */
  logout(): void {
    // Just remove the token from localStorage
    localStorage.removeItem("token");
  }
}
