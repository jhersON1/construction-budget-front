import { Component, Input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [
    MarkdownComponent
  ],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  @Input({ required: true }) text!: string;
  @Input() audioUrl?: string;
  @Input() imageInfo?: { url: string, alt: string };
}
