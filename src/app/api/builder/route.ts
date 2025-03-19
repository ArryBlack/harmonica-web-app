import {
  ApiAction,
  RequestData,
  SessionBuilderData,
  SummaryOfPromptData,
  TemplateEditingData,
} from '@/lib/types';
import { NextResponse } from 'next/server';
import * as llama from '../llamaUtils';
import { createPromptContent } from '../utils';
import { getPromptInstructions } from '@/lib/promptsCache';

export const maxDuration = 200;

export async function POST(req: Request) {
  const request: RequestData = await req.json();
  // Todo: We should possibly switch this to always use 'handleResponse',
  //  so that we can easier switch between streaming and not. But not now.
  console.log('Action: ', request.action);
  switch (request.action) {
    case ApiAction.CreatePrompt:
      return await createNewPrompt(request.data as SessionBuilderData);
    case ApiAction.EditPrompt:
      // console.log('Editing prompt for data: ', data.data);
      const d = request.data as TemplateEditingData;
      const createTemplatePrompt =
        await getPromptInstructions('CREATE_SESSION');
      return llama.handleResponse(
        createTemplatePrompt,
        d.instructions,
        request.stream ?? false,
      );
    case ApiAction.SummaryOfPrompt:
      const summaryData = request.data as SummaryOfPromptData;
      return llama.handleResponse(
        summaryData.instructions,
        summaryData.fullPrompt,
        request.stream ?? false,
      );

    default:
      console.log('Invalid action: ', request.action);
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

async function createNewPrompt(data: SessionBuilderData) {
  console.log('[i] Creating prompt for data: ', data);
  try {
    const createTemplatePrompt = await getPromptInstructions('CREATE_SESSION');
    const threadId = crypto.randomUUID();
    const fullPrompt = await llama.finishedResponse(
      createTemplatePrompt,
      createPromptContent(data),
    );

    return NextResponse.json({
      threadId,
      assistantId: '',
      fullPrompt: fullPrompt,
    });
  } catch (error) {
    console.error('Error in creating new prompt:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
