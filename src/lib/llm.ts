/**
 * myusellm 统一大模型参数配置
 * 默认连接 apihub 端点，支持环境变量覆盖
 */
export const MYUSELLM_CONFIG = {
  baseUrl:
    (typeof process !== 'undefined' && process.env?.APIHUB_BASE_URL) ||
    'https://apihub.agnes-ai.com/v1',
  apiKey:
    (typeof process !== 'undefined' && process.env?.APIHUB_API_KEY) ||
    'sk-GUdpKQNIwwJSZQ5mYyrMnuCJBOwSbB73c2N6NcnNfk5LoKyq',
  defaultModel: 'gemini-2.5-flash',
};

export async function callMyUseLLM(prompt: string, systemInstruction?: string) {
  const response = await fetch(`${MYUSELLM_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MYUSELLM_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: MYUSELLM_CONFIG.defaultModel,
      messages: [
        ...(systemInstruction
          ? [{ role: 'system', content: systemInstruction }]
          : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  return response.json();
}
