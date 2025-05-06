import { environment } from 'environments/environment';
import { QuestionResponse } from '@interfaces/question.response';

export const postQuestionUseCase = async (
  threadId: string,
  question: string,
  file?: File
): Promise<QuestionResponse[]> => {
  try {
    const url = `${environment.assistantApi}/user-question`;
    let resp: Response;

    if (file) {
      // multipart/form-data si hay imagen
      const form = new FormData();
      form.append('threadId', threadId);
      form.append('question', question);
      form.append('image', file);
      resp = await fetch(url, { method: 'POST', body: form });
    } else {
      // JSON normal si solo texto
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, question }),
      });
    }

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    return (await resp.json()) as QuestionResponse[];
  } catch (err) {
    throw new Error('Error enviando pregunta al asistente: ' + err);
  }
};
