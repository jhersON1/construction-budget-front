import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Message } from '@interfaces/message.interface';
import { OpenAiService } from './openai.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public openAiService: OpenAiService = inject(OpenAiService);
  public messages: WritableSignal<Message[]> = signal<Message[]>([]);
  public threadId = signal<string | undefined>(undefined)

  initThreadId() {
    this.openAiService.createThread().subscribe(id => {
      this.threadId.set(id);
    });
  }

  getThreadId() {
    return this.threadId();
  }
  
  addMessage(msg: Message) {
    this.messages.update(prev => [...prev, msg]);
  }

  clearMessages() {
    this.messages.set([]);
    this.threadId.set(undefined);
    localStorage.removeItem('thread');
    alert('Datos limpiados correctamente');
    this.initThreadId();
  }
}
