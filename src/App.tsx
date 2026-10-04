import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { PersonaPicker } from './components/PersonaPicker'
import { WeddingForm } from './components/WeddingForm'
import { StagePanel } from './components/StagePanel'
import { VoiceConsole } from './components/VoiceConsole'
import { SettingsPanel } from './components/SettingsPanel'
import { personas, getPersona } from './data/personas'
import { flows, styleLabels } from './data/flows'
import { parseIntent, type Intent } from './engine/intents'
import { askLlm, emptyLlmConfig, isLlmConfigured } from './engine/llm'
import { fullScriptText, pick, render, scriptFor } from './engine/template'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useSpeech } from './hooks/useSpeech'
import type { CeremonyStyle, LogEntry, LogRole, WeddingInfo } from './types'

const emptyInfo: WeddingInfo = {
  groom: '',
  bride: '',
  date: '',
  venue: '',
  groomParents: '',
  brideParents: '',
  loveStory: '',
  officiant: '',
}

export default function App() {
  const [personaId, setPersonaId] = useLocalStorage('whb.persona', personas[0].id)
  const [style, setStyle] = useLocalStorage<CeremonyStyle>('whb.style', personas[0].defaultStyle)
  const [info, setInfo] = useLocalStorage<WeddingInfo>('whb.info', emptyInfo)
  const [voiceURI, setVoiceURI] = useLocalStorage('whb.voice', '')
  const [rateScale, setRateScale] = useLocalStorage('whb.rate', 1)
  const [llm, setLlm] = useLocalStorage('whb.llm', emptyLlmConfig)

  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [interim, setInterim] = useState('')
  const [thinking, setThinking] = useState(false)

  const persona = getPersona(personaId)
  const segments = flows[style]
  const safeIndex = Math.min(index, segments.length - 1)
  const currentLines = useMemo(() => scriptFor(persona, segments[safeIndex], info), [persona, segments, safeIndex, info])

  const logId = useRef(0)
  const addLog = useCallback((role: LogRole, text: string) => {
    logId.current += 1
    const id = logId.current
    setLog((l) => [...l.slice(-199), { id, role, text, at: Date.now() }])
  }, [])

  const handleIntentRef = useRef<(intent: Intent, raw: string) => void>(() => {})
  const speech = useSpeech({
    onTranscript: (text) => {
      setInterim('')
      addLog('guest', text)
      handleIntentRef.current(parseIntent(text), text)
    },
    onInterim: setInterim,
  })
  const { speak, stopSpeaking } = speech

  const voiceProfile = useMemo(
    () => ({ ...persona.voice, rate: Math.min(2, Math.max(0.5, persona.voice.rate * rateScale)) }),
    [persona, rateScale],
  )

  const say = useCallback(
    (lines: string[]) => {
      const clean = lines.filter(Boolean)
      if (clean.length === 0) return Promise.resolve()
      addLog('host', clean.join(' '))
      return speak(clean, voiceProfile, voiceURI || undefined)
    },
    [addLog, speak, voiceProfile, voiceURI],
  )

  const speakSegment = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, segments.length - 1))
      setIndex(clamped)
      setStarted(true)
      void say(scriptFor(persona, segments[clamped], info))
    },
    [segments, persona, info, say],
  )

  const switchPersona = useCallback(
    (id: string, announce: boolean) => {
      const next = getPersona(id)
      setPersonaId(next.id)
      setStyle(next.defaultStyle)
      setIndex(0)
      setStarted(false)
      if (announce) {
        addLog('system', `已切换为 ${next.title}（${next.name}），流程：${styleLabels[next.defaultStyle]}`)
        void speak([render(next.intro, info)], { ...next.voice, rate: next.voice.rate * rateScale }, voiceURI || undefined)
        addLog('host', render(next.intro, info))
      }
    },
    [setPersonaId, setStyle, addLog, speak, info, rateScale, voiceURI],
  )

  const switchStyle = useCallback(
    (s: CeremonyStyle, announce: boolean) => {
      setStyle(s)
      setIndex(0)
      setStarted(false)
      if (announce) {
        addLog('system', `典礼流程已切换为：${styleLabels[s]}`)
        void say([`好的，典礼流程已切换为${styleLabels[s]}，共${flows[s].length}个环节。`])
      }
    },
    [setStyle, addLog, say],
  )

  const answerField = useCallback(
    (field: Exclude<keyof WeddingInfo, 'officiant'>) => {
      const value = info[field]?.trim()
      const label: Record<typeof field, string> = {
        groom: '新郎是{{groom}}。',
        bride: '新娘是{{bride}}。',
        date: '今天是{{date}}。',
        venue: '婚礼在{{venue}}举行。',
        groomParents: '新郎的父母是{{groomParents}}。',
        brideParents: '新娘的父母是{{brideParents}}。',
        loveStory: '{{loveStory}}',
      }
      if (!value) return say([pick(persona.fillers) + '这个信息新人还没有告诉我，稍后请他们亲自分享。'])
      return say([pick(persona.fillers) + render(label[field], info)])
    },
    [info, persona, say],
  )

  const freeform = useCallback(
    async (text: string) => {
      if (!isLlmConfigured(llm)) return say([render(persona.unknownAnswer, info)])
      setThinking(true)
      try {
        const reply = await askLlm(llm, render(persona.systemPrompt, info), text)
        await say([reply])
      } catch (e) {
        addLog('system', e instanceof Error ? e.message : 'LLM 调用失败')
        await say([render(persona.unknownAnswer, info)])
      } finally {
        setThinking(false)
      }
    },
    [llm, persona, info, say, addLog],
  )

  const handleIntent = (intent: Intent, raw: string) => {
    switch (intent.type) {
      case 'stop':
        stopSpeaking()
        addLog('system', '已停止播报')
        return
      case 'start':
        speakSegment(0)
        return
      case 'next':
        if (!started) return speakSegment(0)
        if (safeIndex >= segments.length - 1) return void say(['典礼已经礼成，感谢大家。'])
        return speakSegment(safeIndex + 1)
      case 'prev':
        return speakSegment(Math.max(0, safeIndex - 1))
      case 'repeat':
        return speakSegment(safeIndex)
      case 'goto':
        if (intent.index < 0 || intent.index >= segments.length)
          return void say([`今天的流程一共${segments.length}个环节，没有第${intent.index + 1}个。`])
        return speakSegment(intent.index)
      case 'blessing':
        return void say([render(pick(persona.blessings), info)])
      case 'intro':
        return void say([render(persona.intro, info)])
      case 'agenda':
        return void say([
          `今天的${styleLabels[style]}一共${segments.length}个环节：` + segments.map((s, i) => `第${i + 1}项，${s.title}`).join('；') + '。',
        ])
      case 'switchPersona':
        return switchPersona(intent.personaId, true)
      case 'switchStyle':
        return switchStyle(intent.style, true)
      case 'ask':
        return void answerField(intent.field)
      case 'freeform':
        return void freeform(raw)
    }
  }
  useEffect(() => {
    handleIntentRef.current = handleIntent
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowRight') handleIntentRef.current({ type: 'next' }, '')
      if (e.key === 'ArrowLeft') handleIntentRef.current({ type: 'prev' }, '')
      if (e.key === 'Escape') handleIntentRef.current({ type: 'stop' }, '')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const exportScript = () => {
    const text = fullScriptText(persona, segments, info)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${info.groom || '新郎'}-${info.bride || '新娘'}-主持稿.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="app" style={{ ['--accent' as string]: persona.accent, ['--accent-soft' as string]: persona.accentSoft }}>
      <header className="topbar">
        <div>
          <h1>婚礼主持机器人</h1>
          <p className="subtitle">多角色 · 中西式流程 · 语音互动</p>
        </div>
        <div className="topbar-meta">
          <span className="pill">{persona.emoji} {persona.title}</span>
          <span className="pill">{styleLabels[style]}</span>
        </div>
      </header>

      <main className="layout">
        <aside className="column">
          <PersonaPicker
            personas={personas}
            activeId={persona.id}
            style={style}
            onSelect={(id) => switchPersona(id, false)}
            onStyleChange={(s) => switchStyle(s, false)}
          />
          <WeddingForm info={info} onChange={setInfo} />
          <SettingsPanel
            voices={speech.voices}
            voiceURI={voiceURI}
            onVoiceChange={setVoiceURI}
            rateScale={rateScale}
            onRateScaleChange={setRateScale}
            llm={llm}
            onLlmChange={setLlm}
            onTestVoice={() => void say([render(persona.intro, info)])}
          />
        </aside>

        <StagePanel
          persona={persona}
          segments={segments}
          index={safeIndex}
          lines={currentLines}
          speaking={speech.speaking}
          started={started}
          onStart={() => speakSegment(0)}
          onPrev={() => speakSegment(safeIndex - 1)}
          onNext={() => speakSegment(safeIndex + 1)}
          onRepeat={() => speakSegment(safeIndex)}
          onStop={() => handleIntentRef.current({ type: 'stop' }, '')}
          onGoto={speakSegment}
          onBlessing={() => handleIntentRef.current({ type: 'blessing' }, '')}
          onExport={exportScript}
        />

        <VoiceConsole
          sttSupported={speech.sttSupported}
          ttsSupported={speech.ttsSupported}
          listening={speech.listening}
          speaking={speech.speaking}
          interim={interim}
          micError={speech.micError}
          log={log}
          thinking={thinking}
          onToggleListening={() => (speech.listening ? speech.stopListening() : speech.startListening())}
          onSubmitText={(text) => {
            addLog('guest', text)
            handleIntentRef.current(parseIntent(text), text)
          }}
          onClearLog={() => setLog([])}
        />
      </main>
    </div>
  )
}
