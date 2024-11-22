import type {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthApiEnum, GroupApiEnum } from '../../common/enums/api.enum';
import { StoreService } from '../services/store.service';

const excludedUrls = [
  `${GroupApiEnum.User}${AuthApiEnum.LoginWithGoogle}`,
  `${GroupApiEnum.User}${AuthApiEnum.GetNonce}`,
  `${GroupApiEnum.User}${AuthApiEnum.LoginWithMetamask}`,
  `${GroupApiEnum.User}${AuthApiEnum.RefreshToken}`,
  `${GroupApiEnum.User}${AuthApiEnum.Logout}`,
];

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storeService = inject(StoreService);

  if (excludedUrls.some((url) => req.url.includes(url))) {
    return next(req);
  }

  const tokens = storeService.getTokens();
  if (tokens.accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return storeService.refreshToken().pipe(
          switchMap((response) => {
            isRefreshing = false;
            const accessToken = response?.data?.tokens?.accessToken;

            if (!accessToken) {
              storeService.clearTokens();
              storeService.router.navigate(['/auth']);
              return throwError(() => new Error('Token refresh failed'));
            }

            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            return next(newReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            storeService.clearTokens();
            storeService.router.navigate(['/auth']);
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
