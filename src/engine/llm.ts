import type { LlmConfig } from '../types'

export const emptyLlmConfig: LlmConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
}

export const isLlmConfigured = (c: LlmConfig) => Boolean(c.apiKey.trim() && c.baseUrl.trim() && c.model.trim())

/**
 * Minimal OpenAI-compatible chat completion call. Works with OpenAI, DeepSeek,
 * Moonshot, Qwen (DashScope compatible mode), Ollama, etc.
 */
export async function askLlm(config: LlmConfig, systemPrompt: string, userText: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.8,
      max_tokens: 200,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
    }),
    signal,
  })
  if (!res.ok) throw new Error(`LLM 请求失败：${res.status} ${res.statusText}`)
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('LLM 返回为空')
  return content
}
