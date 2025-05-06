import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Message } from '@interfaces/message.interface';
import { OpenAiService } from './openai.service';

export interface Thread {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public openAiService: OpenAiService = inject(OpenAiService);
  public messages: WritableSignal<Message[]> = signal<Message[]>([]);
  public threadId = signal<string | undefined>(undefined);
  public threads: WritableSignal<Thread[]> = signal<Thread[]>([]);

  constructor() {
    // Cargar threads previos
    const stored = localStorage.getItem('threads');
    if (stored) {
      this.threads.set(JSON.parse(stored));
    }
    // Restaurar o crear hilo principal
    const savedId = localStorage.getItem('thread');
    if (savedId) {
      // Asegurar que existe en la lista de threads
      if (!this.threads().some(t => t.id === savedId)) {
        this.threads.update(prev => [...prev, { id: savedId, name: `Chat ${this.threads().length + 1}` }]);
        localStorage.setItem('threads', JSON.stringify(this.threads()));
      }
      // Cargar ese hilo
      this.loadThread(savedId);
    } else {
      // Crear nuevo hilo por defecto
      this.initThreadId();
    }
  }

  private saveThreads() {
    localStorage.setItem('threads', JSON.stringify(this.threads()));
  }

  private saveMessagesFor(id: string, msgs: Message[]) {
    localStorage.setItem(`thread_${id}`, JSON.stringify(msgs));
  }

  initThreadId() {
    this.openAiService.createThread().subscribe(id => {
      this.threadId.set(id);
      // Registrar en threads si no existe
      if (!this.threads().some(t => t.id === id)) {
        this.threads.update(prev => [...prev, { id, name: `Chat ${this.threads().length + 1}` }]);
        this.saveThreads();
      }
      // Persistir hilo actual y mensajes vacíos
      localStorage.setItem('thread', id);
      this.messages.set([]);
    });
  }

  getThreadId() {
    return this.threadId();
  }

  addMessage(msg: Message) {
    const id = this.threadId();
    if (id) {
      this.addMessageToThread(msg, id);
    }
  }

  clearMessages() {
    this.messages.set([]);
    this.threadId.set(undefined);
    localStorage.removeItem('thread');
    alert('Datos limpiados correctamente');
    this.threads.set([]);
    localStorage.removeItem('threads');
    this.initThreadId();
  }

  /** Arranca un nuevo chat, guardando primero el actual */
  newChat() {
    const current = this.threadId();
    if (current) {
      this.saveMessagesFor(current, this.messages());
      localStorage.removeItem('thread');
    }
    // Limpiar y crear hilo
    this.messages.set([]);
    this.threadId.set(undefined);
    this.initThreadId();
  }

  /** Cambia a un chat existente, guardando el actual */
  loadThread(threadId: string) {
    const prev = this.threadId();
    if (prev) {
      this.saveMessagesFor(prev, this.messages());
    }
    // Limpiar vista antes de cargar
    this.messages.set([]);
    // Ajustar hilo
    this.threadId.set(threadId);
    localStorage.setItem('thread', threadId);
    // Cargar mensajes guardados
    const saved = localStorage.getItem(`thread_${threadId}`);
    this.messages.set(saved ? JSON.parse(saved) : []);
  }

  /**
 * Guarda un mensaje en el hilo dado, y sólo si
 * ese hilo está activo en la UI, actualiza la señal `messages`.
 */
  addMessageToThread(msg: Message, threadId: string) {
    // 1. Cargar del storage los mensajes viejos de ese hilo
    const savedJson = localStorage.getItem(`thread_${threadId}`);
    const oldMsgs: Message[] = savedJson ? JSON.parse(savedJson) : [];

    // 2. Append
    const updated = [...oldMsgs, msg];

    // 3. Guardar siempre en localStorage
    this.saveMessagesFor(threadId, updated);

    // 4. Sólo si ese hilo coincide con el activo, actualizo la señal
    if (this.threadId() === threadId) {
      this.messages.set(updated);
    }
  }
}
