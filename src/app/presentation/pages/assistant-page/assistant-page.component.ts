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

  public messages: WritableSignal<Message[]> = this.messageService.messages;

  handleMessage(event: string | ITextMessageEvent): void {
    this.isLoading.set(true);

    if (typeof event === 'string') {
      this.addMyText(event);
    } else {
      this.addMyText(event.prompt ?? '');
    }

    const prompt = typeof event === 'string' ? event : event.prompt ?? '';
    const file = typeof event === 'string' ? undefined : event.file;

    const threadIdAtCall = this.messageService.getThreadId()!;

    this.openAiService.postQuestion(this.messageService.getThreadId()!, prompt, file)
      .subscribe(replies => this.handleReplies(replies, threadIdAtCall));
  }

  private addMyText(text: string) {
    this.messageService.addMessage({ text, isGpt: false });
  }
  
  private handleReplies(replies: QuestionResponse[], threadId: string): void {
    this.isLoading.set(false);

    // Cargo los mensajes ya guardados en ese hilo para deduplicar
    const savedJson = localStorage.getItem(`thread_${threadId}`);
    const currentMsgs: Message[] = savedJson ? JSON.parse(savedJson) : [];
    const seen = new Set(currentMsgs.map(m => m.text || m.imageInfo?.url));

    for (const reply of replies) {
      for (const part of reply.content) {
        let msg: Message;
        if (typeof part === 'string') {
          if (seen.has(part)) continue;
          msg = { text: part, isGpt: true };
          seen.add(part);
        } else {
          const url = `${environment.assistantApi}/assistant/files/${part.fileId}`;
          if (seen.has(url)) continue;
          msg = {
            imageInfo: { url, alt: 'Imagen del asistente' },
            isGpt: true,
            text: ''
          };
          seen.add(url);
        }
        // Esta llamada guarda en storage y, sólo si threadId sigue activo,
        // actualiza la UI.
        this.messageService.addMessageToThread(msg, threadId);
      }
    }
  }


}
