export type ContentPart = 
  | string
  | { type: 'image'; fileId: string };

export interface QuestionResponse {
  role: 'user' | 'assistant';
  content: ContentPart[];
}
