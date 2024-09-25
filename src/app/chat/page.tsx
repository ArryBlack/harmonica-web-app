'use client';

import { memo, useEffect, useState } from 'react';

import Chat from '@/components/chat';
import { useSearchParams } from 'next/navigation';
import { useSessionStore } from '@/stores/SessionStore';
import { accumulateSessionData, sendCallToMake } from '@/lib/utils';
import { ApiAction, ApiTarget } from '@/lib/types';

type Message = {
  type: string;
  text: string;
};

const StandaloneChat = () => {
  const [message, setMessage] = useState<Message>({
    type: 'ASSISTANT',
    text: `Nice to meet you! Before we get started, here are a few things to keep in mind

I’m going to ask you a few questions to help structure your contribution to this session.

✨ After you share your thoughts, we’ll synthesize these with feedback from other participants to create an AI-powered overview

🗣️ We’d love to see as much detail as possible, though even a few sentences are helpful. You can skip any questions simply by asking to move on.

Help & Support:

🌱 Harmonica is still in the early stages of development, so we would appreciate your patience and feedback

💬 Could you please let me know your name?
`,
  });

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('s');
  const assistantId = searchParams.get('a');

  const [accumulated, setAccumulated] = useSessionStore((state) => [
    state.accumulated[sessionId],
    state.addAccumulatedSessions,
  ]);

  const [userSessionId, setUserSessionId] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let msg: Message;
      console.log('Message event received: ', event);
      if (event.data.type === 'message') {
        msg = event.data;
      }
      setMessage(msg);
    };

    window.addEventListener('message', handleMessage);

    if (sessionId && !accumulated) {
      sendCallToMake({
        target: ApiTarget.Session,
        action: ApiAction.Stats,
        data: {
          session_id: sessionId,
        },
      }).then((data) => {
        console.log('[i] Accumulated data:', accumulateSessionData(data));
        setAccumulated(sessionId, accumulateSessionData(data));
      });
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (accumulated && accumulated.session_data.template) {
      sendCallToMake({
        target: ApiTarget.Session,
        action: ApiAction.CreateUserSession,
        data: {
          session_id: sessionId,
          user_id: 'anonymous',
          template: accumulated.session_data.template,
          active: 1,
        },
      })
        .then((data) => {
          if (data.session_id) setUserSessionId(data.session_id);
        })
        .catch((error) =>
          console.error('[!] error creating user session -> ', error),
        );
    }
  }, [accumulated]);

  return (
    <div
      className="flex flex-col bg-gray-100"
      style={{ height: 'calc(100vh - 45px)' }}
    >
      <div className="h-full flex-grow flex flex-col items-center justify-center p-6">
        <div className="h-full w-full flex flex-col flex-grow">
          <h1 className="text-2xl font-bold mb-6">Web chat</h1>

          {(accumulated?.session_data?.template || assistantId) && (
            <Chat
              entryMessage={message}
              assistantId={
                accumulated ? accumulated.session_data.template : assistantId
              }
              sessionId={userSessionId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(StandaloneChat);
