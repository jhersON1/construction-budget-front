import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { createThreadUseCase } from 'app/core/use-case/assistant/create-thread.use-case';
import { postQuestionUseCase } from 'app/core/use-case/assistant/post-question.use-case';
import { from, Observable, of, tap } from 'rxjs';

export interface Message {
  role: 'user' | 'assistant';
  content: any;
}

@Injectable({ providedIn: 'root' })
export class OpenAiService {
  private apiUrl =
    'https://construction-budget-back.onrender.com/assistant/text-to-json';
  private reportsUrl =
    'https://construction-budget-back.onrender.com/reports/bill'; // URL para generar PDF
  private http = inject(HttpClient);

  createThread(): Observable<string> {
    if (localStorage.getItem('thread')) {
      return of(localStorage.getItem('thread')!);
    }

    return from(createThreadUseCase()).pipe(
      tap((thread) => {
        localStorage.setItem('thread', thread);
      })
    );
  }

  postQuestion(threadId: string, question: string, file?: File) {
    return from(postQuestionUseCase(threadId, question, file));
  }

  convertTextToJson(messages: Message[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { messages });
  }

  // Nueva función para generar y descargar PDF
  generatePdf(data: any): Observable<Blob> {
    return this.http.post(this.reportsUrl, data, {
      responseType: 'blob', // Importante para recibir datos binarios
    });
  }
}
