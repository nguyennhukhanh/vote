import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { NavbarComponent } from '../navbar/navbar.component';
import { StoreService } from '../services/store.service';

interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.sass',
})
export class ChatComponent {
  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    @Inject(StoreService) private storeService: StoreService,
  ) {}

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim()) return;

    const userMessage = this.newMessage;
    this.messages.push({
      content: userMessage,
      isBot: false,
      timestamp: new Date(),
    });
    this.newMessage = '';
    this.isLoading = true;

    try {
      const accessToken = this.storeService.getTokens().accessToken;
      const response = await firstValueFrom(
        this.http.post<{ data: string }>(
          `${environment.apiUrl}/chat/ask`,
          { message: userMessage },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );

      this.messages.push({
        content: response.data,
        isBot: true,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      this.messages.push({
        content: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date(),
      });
    } finally {
      this.isLoading = false;
    }
  }
}
