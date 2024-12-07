import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

import { AuthApiEnum, GroupApiEnum } from '../../common/enums/api.enum';
import type { IResponse } from '../../common/interfaces/response.interface';
import { environment } from '../../environments/environment.development';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.sass',
})
export class AuthComponent {
  email: string = '';
  password: string = '';

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private readonly store: StoreService,
  ) {}

  async login() {
    try {
      const body = { email: this.email, password: this.password };
      const response = await firstValueFrom(
        this.http.post<IResponse>(
          `${environment.apiUrl}${GroupApiEnum.Admin}${AuthApiEnum.Login}`,
          body,
        ),
      );

      this.store.saveTokens(response?.data?.tokens, true);
    } catch (error: any) {
      const message = error.error?.meta?.message || 'Invalid email or password';
      toast.error(message);
    }
  }
}
