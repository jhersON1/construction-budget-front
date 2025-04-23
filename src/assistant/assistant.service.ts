import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { checkCompleteStatusUseCase, createMessageUseCase, createRunUseCase, createThreadUseCase, getMessageListUseCase } from './use-cases';
import { QuestionDto } from './dto/question.dto';

@Injectable()
export class AssistantService {
    private openai: OpenAI;

    constructor(readonly configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY')
        });
    }

    async createThread() {
        return await createThreadUseCase(this.openai);
    }

    async userQuestion(questionDto: QuestionDto, image?: Express.Multer.File) {
        const { threadId, question } = questionDto;

        const message = await createMessageUseCase(this.openai, {
            threadId,
            question,
            fileContent: image?.buffer,
            fileName: image?.originalname
        });

        const run = await createRunUseCase(this.openai, { threadId });

        await checkCompleteStatusUseCase(this.openai, {
            runId: run.id,
            threadId
        });

        const messages = await getMessageListUseCase(this.openai, { threadId });
        return messages;
    }
}
