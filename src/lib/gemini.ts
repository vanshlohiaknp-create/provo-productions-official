export type GeminiHistory = { role: 'user' | 'assistant'; content: string }

const DEFAULT_MAX_OUTPUT_TOKENS = 600

export async function callGemini(
  apiKey: string | undefined,
  model: string,
  history: GeminiHistory[],
  userMsg: string,
  signal: AbortSignal,
): Promise<string> {
  if (!apiKey) {
    return "I'm in offline mode. Add VITE_GEMINI_API_KEY to your .env to enable the Elite Brain."
  }

  const GEMINI_API = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`

  const contents = [
    ...history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: userMsg }] },
  ]

  const body = JSON.stringify({
    contents,
    generationConfig: { maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS },
  })

  const res = await fetch(GEMINI_API, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any)?.error?.message || `API error ${res.status}`
    if (res.status === 404 || /model.*not found|not found|Invalid model/i.test(msg)) {
      return 'The Elite Brain is temporarily unavailable. Please verify VITE_GEMINI_API_KEY and try again shortly.'
    }
    throw new Error(msg)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text?.trim()) {
    throw new Error('The Elite Brain returned no content. Please try again in a moment.')
  }

  return text
}
