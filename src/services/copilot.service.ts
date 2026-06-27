import { fetchWithAuth } from '../lib/api';

export const sendCopilotMessage = async (message: string, token: string | null, profileId?: string, sessionId?: string) => {
  return fetchWithAuth('/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({ message, profileId, sessionId })
  }, token);
};
