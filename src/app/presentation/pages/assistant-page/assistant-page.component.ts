import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from "@angular/common";
import {
  ChatMessageComponent,
  ITextMessageEvent,
  MyMessageComponent,
  TextMessageBoxFileComponent,
  TypingLoaderComponent
} from '@components/index';
import { OpenAiService } from '../../services/openai.service';
import { Message, QuestionResponse } from '@interfaces/index';
import { environment } from 'environments/environment';
import { MessageService } from 'app/presentation/services/message.service';


@Component({
  selector: 'app-assistant-page',
  imports: [
    CommonModule,
    ChatMessageComponent,
    MyMessageComponent,
    TypingLoaderComponent,
    TextMessageBoxFileComponent
  ],
  templateUrl: './assistant-page.component.html',
  styleUrl: './assistant-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AssistantPageComponent {
  public isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public openAiService: OpenAiService = inject(OpenAiService);

  private messageService = inject(MessageService);

  public messages: WritableSignal<Message[]>  = this.messageService.messages;

  handleMessage(event: string | ITextMessageEvent): void {
    this.isLoading.set(true);

    if (typeof event === 'string') {
      this.addMyText(event);
    } else {
      this.addMyText(event.prompt ?? '');
    }

    const prompt = typeof event === 'string' ? event : event.prompt ?? '';
    const file = typeof event === 'string' ? undefined : event.file;

    this.openAiService.postQuestion(this.messageService.getThreadId()!, prompt, file)
      .subscribe(replies => this.handleReplies(replies));
  }

  private addMyText(text: string) {
    this.messageService.addMessage({ text, isGpt: false });
  }

  private handleReplies(replies: QuestionResponse[]): void {
    this.isLoading.set(false);
     console.log('handleReplies', replies);
    const seen = new Set(
      this.messageService.messages().map(m => m.text || m.imageInfo?.url)
    );

    for (const reply of replies) {
      for (const part of reply.content) {
        if (typeof part === 'string') {
          if (!seen.has(part)) {
            this.messageService.addMessage({ text: part, isGpt: true });
            seen.add(part);
          }
        } else if (part.type === 'image') {
          // Construir URL con tu entorno
          const url = `${environment.assistantApi}/assistant/files/${part.fileId}`;
          if (!seen.has(url)) {
            this.messageService.addMessage({
              imageInfo: { url, alt: 'Imagen del asistente' },
              isGpt: true,
              text: ''
            });
            seen.add(url);
          }
        }
      }
    }
  }

}
