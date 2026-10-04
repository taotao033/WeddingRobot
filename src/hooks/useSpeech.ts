import { useCallback, useEffect, useRef, useState } from 'react'
import type { VoiceProfile } from '../types'

type RecognitionCtor = new () => SpeechRecognitionLike

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}

function getRecognitionCtor(): RecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface UseSpeechOptions {
  onTranscript: (text: string) => void
  onInterim?: (text: string) => void
}

export function useSpeech({ onTranscript, onInterim }: UseSpeechOptions) {
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const sttSupported = typeof window !== 'undefined' && getRecognitionCtor() !== null

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const wantListeningRef = useRef(false)
  const speakingRef = useRef(false)
  const callbacksRef = useRef({ onTranscript, onInterim })
  useEffect(() => {
    callbacksRef.current = { onTranscript, onInterim }
  })

  useEffect(() => {
    if (!ttsSupported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [ttsSupported])

  const pickVoice = useCallback(
    (profile: VoiceProfile, preferredURI?: string): SpeechSynthesisVoice | undefined => {
      if (preferredURI) {
        const v = voices.find((x) => x.voiceURI === preferredURI)
        if (v) return v
      }
      const langMatch = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(profile.lang.toLowerCase()))
      for (const hint of profile.preferredVoices) {
        const v = langMatch.find((x) => x.name.includes(hint)) ?? voices.find((x) => x.name.includes(hint))
        if (v) return v
      }
      return langMatch[0] ?? voices.find((v) => v.lang.toLowerCase().startsWith('zh'))
    },
    [voices],
  )

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return
    window.speechSynthesis.cancel()
    speakingRef.current = false
    setSpeaking(false)
  }, [ttsSupported])

  const startRecognition = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    try {
      rec.start()
    } catch {
      /* already started */
    }
  }, [])

  /**
   * Speak lines sequentially. Recognition is paused while speaking so the
   * microphone does not transcribe the robot's own voice.
   */
  const speak = useCallback(
    (lines: string[], profile: VoiceProfile, preferredURI?: string) =>
      new Promise<void>((resolve) => {
        if (!ttsSupported || lines.length === 0) return resolve()
        window.speechSynthesis.cancel()
        speakingRef.current = true
        setSpeaking(true)
        if (wantListeningRef.current) recognitionRef.current?.abort()

        const voice = pickVoice(profile, preferredURI)
        let remaining = lines.length
        let done = false
        const complete = () => {
          if (done) return
          done = true
          window.clearTimeout(watchdog)
          speakingRef.current = false
          setSpeaking(false)
          if (wantListeningRef.current) setTimeout(startRecognition, 250)
          resolve()
        }
        const finish = () => {
          remaining -= 1
          if (remaining <= 0) complete()
        }
        // Some engines never fire onend (e.g. no installed voices); don't leave the UI stuck in "speaking".
        const totalChars = lines.reduce((n, l) => n + l.length, 0)
        const watchdog = window.setTimeout(() => {
          window.speechSynthesis.cancel()
          complete()
        }, (totalChars * 400) / profile.rate + 8000)
        for (const line of lines) {
          const u = new SpeechSynthesisUtterance(line)
          u.lang = profile.lang
          u.rate = profile.rate
          u.pitch = profile.pitch
          if (voice) u.voice = voice
          u.onend = finish
          u.onerror = finish
          window.speechSynthesis.speak(u)
        }
      }),
    [ttsSupported, pickVoice, startRecognition],
  )

  useEffect(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = 'zh-CN'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        const text = r[0].transcript.trim()
        if (r.isFinal) {
          if (text) callbacksRef.current.onTranscript(text)
        } else interim += text
      }
      callbacksRef.current.onInterim?.(interim)
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicError('麦克风权限被拒绝，请在浏览器地址栏允许麦克风访问。')
        wantListeningRef.current = false
        setListening(false)
      } else if (e.error === 'network') {
        setMicError('语音识别需要联网（浏览器识别服务）。')
      }
    }
    rec.onend = () => {
      if (wantListeningRef.current && !speakingRef.current) setTimeout(() => rec.start(), 300)
    }
    recognitionRef.current = rec
    return () => {
      wantListeningRef.current = false
      rec.onend = null
      rec.abort()
    }
  }, [])

  const startListening = useCallback(() => {
    if (!sttSupported) return
    setMicError(null)
    wantListeningRef.current = true
    setListening(true)
    if (!speakingRef.current) startRecognition()
  }, [sttSupported, startRecognition])

  const stopListening = useCallback(() => {
    wantListeningRef.current = false
    setListening(false)
    recognitionRef.current?.abort()
  }, [])

  return {
    ttsSupported,
    sttSupported,
    voices,
    speaking,
    listening,
    micError,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  }
}
