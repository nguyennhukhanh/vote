import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthApiEnum, GroupApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import type { TokensType } from '../../common/types';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(
    @Inject(Router) public router: Router,
    @Inject(HttpClient)
    private http: HttpClient,
  ) {}

  saveTokens(tokens: object, shouldNavigate: boolean = false) {
    localStorage.setItem('tokens', JSON.stringify(tokens));

    if (shouldNavigate) {
      this.router.navigate(['']);
    }
  }

  saveAdminTokens(tokens: object, shouldNavigate: boolean = false) {
    localStorage.setItem('tokens', JSON.stringify(tokens));

    if (shouldNavigate) {
      this.router.navigate(['']);
    }
  }

  getTokens(): TokensType {
    return JSON.parse(localStorage.getItem('tokens') || '{}');
  }

  clearTokens() {
    localStorage.removeItem('tokens');
  }

  refreshToken() {
    const refreshToken = this.getTokens().refreshToken;

    if (!refreshToken) {
      this.clearTokens();
      this.router.navigate(['/auth']);
      return throwError(() => new Error('No refresh token'));
    }

    return this.http
      .get<IResponse>(
        `${environment.apiUrl}${GroupApiEnum.Admin}${AuthApiEnum.RefreshToken}`,
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        },
      )
      .pipe(
        map((response) => {
          console.log({ response });
          if (response?.data?.tokens) {
            this.saveTokens(response.data.tokens, false);
            return response;
          }
          throw new Error('Invalid refresh token response');
        }),
        catchError((error) => {
          console.log({ error });
          this.clearTokens();
          return throwError(() => error);
        }),
      );
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getTokens().refreshToken;
      const response = await firstValueFrom(
        this.http.get<IResponse>(
          `${environment.apiUrl}${GroupApiEnum.Admin}${AuthApiEnum.Logout}`,
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        ),
      );
      if (response?.data?.isLogout) {
        localStorage.removeItem('tokens');
        this.router.navigate(['/auth']);
      }
    } catch (error) {
      throw error;
    }
  }
}
