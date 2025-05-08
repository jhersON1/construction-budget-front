import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
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
    const stored = localStorage.getItem('threads');
    if (stored) {
      try {
        this.threads.set(JSON.parse(stored));
      } catch (e) {
        console.error('[MessageService] Error al parsear threads:', e);
        this.threads.set([]);
      }
    }

    const savedId = localStorage.getItem('thread');
    if (savedId) {
      if (!this.threads().some(t => t.id === savedId)) {
        this.threads.update(prev => [...prev, { id: savedId, name: `Chat ${this.threads().length + 1}` }]);
        this.saveThreads();
      }

      this.threadId.set(savedId);

      this.refreshMessagesFromStorage(savedId);
    } else {
      this.initThreadId();
    }

    effect(() => {
      const currentThreadId = this.threadId();
      if (currentThreadId) {
        this.refreshMessagesFromStorage(currentThreadId);
      }
    });
  }

  /**
   * Guarda la lista de hilos en localStorage
   */
  private saveThreads() {
    localStorage.setItem('threads', JSON.stringify(this.threads()));
  }

  /**
   * Guarda los mensajes de un hilo específico en localStorage
   * @param id - Identificador del hilo
   * @param msgs - Lista de mensajes a guardar
   */
  private saveMessagesFor(id: string, msgs: Message[]) {
    localStorage.setItem(id, JSON.stringify(msgs));
  }

  /**
   * Carga los mensajes desde localStorage para un hilo específico
   * y actualiza la señal de mensajes
   * @param threadId - Identificador del hilo a cargar
   */
  private refreshMessagesFromStorage(threadId: string) {
    const saved = localStorage.getItem(threadId);
    const messages = saved ? JSON.parse(saved) : [];
    this.messages.set(messages);
  }

  /**
   * Inicializa un nuevo ID de hilo mediante una llamada al servicio
   * y lo registra en la lista de hilos
   */
  initThreadId() {
    this.openAiService.createThread().subscribe({
      next: (id) => {
        if (!this.threads().some(t => t.id === id)) {
          this.threads.update(prev => [...prev, { id, name: `Chat ${this.threads().length + 1}` }]);
          this.saveThreads();
        }

        localStorage.setItem('thread', id);
        this.threadId.set(id);
      },
      error: (err) => {
        console.error('[MessageService] Error al crear thread:', err);
        const threads = this.threads();
        if (threads.length > 0) {
          const firstThread = threads[0].id;
          localStorage.setItem('thread', firstThread);
          this.threadId.set(firstThread);
        } else {
          alert('Error al conectar con el servidor. Por favor, intenta más tarde.');
        }
      }
    });
  }

  /**
   * Obtiene el ID del hilo actual
   * @returns El ID del hilo actual o undefined si no hay ninguno
   */
  getThreadId() {
    return this.threadId();
  }

  /**
   * Añade un mensaje al hilo actual
   * @param msg - Mensaje a añadir
   */
  addMessage(msg: Message) {
    const id = this.threadId();
    if (id) {
      this.addMessageToThread(msg, id);
    }
  }

  /**
   * Elimina todos los mensajes y hilos almacenados e inicializa un nuevo hilo
   */
  clearMessages() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (this.threads().some(t => t.id === key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('thread');
    localStorage.removeItem('threads');

    this.messages.set([]);
    this.threadId.set(undefined);
    this.threads.set([]);

    alert('Datos limpiados correctamente');
    this.initThreadId();
  }

  /**
   * Crea un nuevo hilo de conversación, guardando primero el actual
   */
  newChat() {
    const current = this.threadId();
    if (current) {
      this.saveMessagesFor(current, this.messages());
    }

    this.messages.set([]);
    this.threadId.set(undefined);
    localStorage.removeItem('thread');

    this.initThreadId();
  }

  /**
   * Cambia al hilo especificado, guardando primero el hilo actual
   * @param threadId - ID del hilo al que cambiar
   */
  loadThread(threadId: string) {
    const prev = this.threadId();
    if (prev && prev !== threadId) {
      this.saveMessagesFor(prev, this.messages());
    }

    this.messages.set([]);

    const savedJson = localStorage.getItem(threadId);
    const newMessages = savedJson ? JSON.parse(savedJson) : [];

    localStorage.setItem('thread', threadId);
    this.threadId.set(threadId);
    this.messages.set(newMessages);
  }

  /**
   * Añade un mensaje a un hilo específico y actualiza la UI si es el hilo activo
   * @param msg - Mensaje a añadir
   * @param threadId - ID del hilo al que añadir el mensaje
   */
  addMessageToThread(msg: Message, threadId: string) {
    const savedJson = localStorage.getItem(threadId);
    const oldMsgs: Message[] = savedJson ? JSON.parse(savedJson) : [];
    const updated = [...oldMsgs, msg];

    this.saveMessagesFor(threadId, updated);

    if (this.threadId() === threadId) {
      this.messages.set(updated);
    }
  }

  /**
   * Obtiene los mensajes de un hilo específico desde localStorage
   * @param threadId - ID del hilo
   * @returns Lista de mensajes del hilo
   */
  getMessagesFromThread(threadId: string): Message[] {
    const savedJson = localStorage.getItem(threadId);
    return savedJson ? JSON.parse(savedJson) : [];
  }

  /**
   * Fuerza la recarga de mensajes del hilo actual desde localStorage
   * Útil cuando se reciben respuestas asincrónicas del servidor
   */
  refreshCurrentMessages() {
    const current = this.threadId();
    if (current) {
      this.refreshMessagesFromStorage(current);
    }
  }
}
