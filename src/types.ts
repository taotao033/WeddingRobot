export type CeremonyStyle = 'chinese' | 'western' | 'fusion'

export interface WeddingInfo {
  groom: string
  bride: string
  date: string
  venue: string
  groomParents: string
  brideParents: string
  loveStory: string
  officiant: string
}

export interface VoiceProfile {
  lang: string
  rate: number
  pitch: number
  /** Substring hints used to pick a preferred system voice, in priority order. */
  preferredVoices: string[]
}

export interface Persona {
  id: string
  name: string
  title: string
  tagline: string
  description: string
  emoji: string
  defaultStyle: CeremonyStyle
  accent: string
  accentSoft: string
  voice: VoiceProfile
  intro: string
  blessings: string[]
  fillers: string[]
  unknownAnswer: string
  /** Segment id -> lines. Missing segments fall back to the neutral script. */
  scripts: Record<string, string[]>
  /** System prompt used when an LLM endpoint is configured. */
  systemPrompt: string
}

export interface Segment {
  id: string
  title: string
  cue: string
  defaultScript: string[]
}

export interface LlmConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export type LogRole = 'host' | 'guest' | 'system'

export interface LogEntry {
  id: number
  role: LogRole
  text: string
  at: number
}
