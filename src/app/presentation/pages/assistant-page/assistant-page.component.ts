import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  public messages: WritableSignal<Message[]> = this.messageService.messages;

  constructor() {
    effect(() => {
      this.messageService.getThreadId();
    });
  }

  /**
   * Maneja el envío de un nuevo mensaje por parte del usuario
   * @param event - Texto o evento de mensaje con posible archivo adjunto
   */
  handleMessage(event: string | ITextMessageEvent): void {
    this.isLoading.set(true);

    // Añadir mensaje del usuario a la UI
    if (typeof event === 'string') {
      this.addMyText(event);
    } else {
      this.addMyText(event.prompt ?? '');
    }

    // Preparar datos para enviar al servidor
    const prompt = typeof event === 'string' ? event : event.prompt ?? '';
    const file = typeof event === 'string' ? undefined : event.file;
    const threadIdAtCall = this.messageService.getThreadId()!;

    // Enviar pregunta al servicio
    this.openAiService.postQuestion(threadIdAtCall, prompt, file)
      .subscribe({
        next: replies => {
          this.handleReplies(replies, threadIdAtCall);

          if (this.messageService.getThreadId() === threadIdAtCall) {
            this.messageService.refreshCurrentMessages();
            this.cdr.markForCheck();
          }
        },
        error: err => {
          console.error('Error al recibir respuesta:', err);
          this.isLoading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Añade un mensaje de texto del usuario
   * @param text - Texto del mensaje
   */
  private addMyText(text: string) {
    this.messageService.addMessage({ text, isGpt: false });
    this.cdr.markForCheck();
  }

  /**
   * Procesa las respuestas recibidas del servidor
   * @param replies - Respuestas del asistente
   * @param threadId - ID del hilo al que pertenecen las respuestas
   */
  private handleReplies(replies: QuestionResponse[], threadId: string): void {
    this.isLoading.set(false);

    const currentMsgs = this.messageService.getMessagesFromThread(threadId);
    const seen = new Set(currentMsgs.map(m => m.text || m.imageInfo?.url));

    for (const reply of replies) {
      for (const part of reply.content) {
        let msg: Message;
        if (typeof part === 'string') {
          // Evitar duplicados de texto
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

        this.messageService.addMessageToThread(msg, threadId);
      }
    }

    this.cdr.markForCheck();
  }
}
