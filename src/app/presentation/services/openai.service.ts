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

  private apiUrl = 'http://localhost:3000/assistant/text-to-json';
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
}
