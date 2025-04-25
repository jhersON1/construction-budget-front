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
export default class AssistantPageComponent implements OnInit {
  public messages: WritableSignal<Message[]> = signal<Message[]>([])
  public isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public openAiService: OpenAiService = inject(OpenAiService);

  public threadId = signal<string | undefined>(undefined)

  ngOnInit(): void {
    this.openAiService.createThread().subscribe(id => {
      this.threadId.set(id);
    });
  }

  handleMessage(event: string | ITextMessageEvent): void {
    this.isLoading.set(true);

    // 1. Mostrar mensaje propio
    if (typeof event === 'string') {
      this.addMyText(event);
    } else {
      this.addMyText(event.prompt ?? '');
    }

    // 2. Enviar a la API (pasa file si existe)
    const prompt = typeof event === 'string' ? event : event.prompt ?? '';
    const file = typeof event === 'string' ? undefined : event.file;
    this.openAiService.postQuestion(this.threadId()!, prompt, file)
      .subscribe(replies => this.handleReplies(replies));
  }

  private addMyText(text: string) {
    this.messages.update(prev => [
      ...prev,
      { text, isGpt: false }
    ]);
  }

  private handleReplies(replies: QuestionResponse[]) {
    this.isLoading.set(false);
    const seen = new Set(this.messages().map(m => m.text || m.imageInfo?.url));

    for (const reply of replies) {
      for (const part of reply.content) {
        if (typeof part === 'string') {
          if (!seen.has(part)) {
            this.messages.update(prev => [
              ...prev,
              { text: part, isGpt: true }
            ]);
            seen.add(part);
          }
        } else if (part.type === 'image') {
          //todo: hacer en el backend una conexión con cloudinary para obtener la url de la imagen
          const url = `${environment.assistantApi}/assistant/files/${part.fileId}`;
          if (!seen.has(url)) {
            this.messages.update(prev => [
              ...prev,
              {
                imageInfo: { url, alt: 'Imagen del asistente' }, isGpt: true,
                text: ''
              }
            ]);
            seen.add(url);
          }
        }
      }
    }
  }

}
