import { Injectable } from '@angular/core';
import { createThreadUseCase } from 'app/core/use-case/assistant/create-thread.use-case';
import { postQuestionUseCase } from 'app/core/use-case/assistant/post-question.use-case';
import { from, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OpenAiService {

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
}
