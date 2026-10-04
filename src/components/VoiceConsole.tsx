import { useEffect, useRef, useState } from 'react'
import type { LogEntry } from '../types'
import { voiceCommandHelp } from '../engine/intents'

interface Props {
  sttSupported: boolean
  ttsSupported: boolean
  listening: boolean
  speaking: boolean
  interim: string
  micError: string | null
  log: LogEntry[]
  thinking: boolean
  onToggleListening: () => void
  onSubmitText: (text: string) => void
  onClearLog: () => void
}

export function VoiceConsole(props: Props) {
  const [text, setText] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  const lastEntry = props.log[props.log.length - 1]
  useEffect(() => {
    const el = logRef.current
    if (el && (lastEntry || props.thinking)) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [lastEntry, props.thinking])

  const submit = () => {
    const t = text.trim()
    if (!t) return
    props.onSubmitText(t)
    setText('')
  }

  return (
    <section className="card console">
      <header className="console-header">
        <h2 className="card-title">语音交互</h2>
        <button type="button" className="ghost small" onClick={() => setShowHelp((v) => !v)}>
          {showHelp ? '收起指令' : '语音指令'}
        </button>
      </header>

      {showHelp && (
        <ul className="help">
          {voiceCommandHelp.map(([cmd, desc]) => (
            <li key={cmd}>
              <code>{cmd}</code>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mic-area">
        <button
          type="button"
          className={`mic ${props.listening ? 'on' : ''}`}
          onClick={props.onToggleListening}
          disabled={!props.sttSupported}
          aria-pressed={props.listening}
          title={props.sttSupported ? '切换持续聆听' : '当前浏览器不支持语音识别'}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
            <path
              fill="currentColor"
              d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93V22h2v-3.07A8 8 0 0 0 20 11h-2Z"
            />
          </svg>
        </button>
        <div className="mic-status">
          {!props.sttSupported ? (
            <span className="warn">此浏览器不支持语音识别，请使用 Chrome / Edge，或在下方输入文字。</span>
          ) : props.micError ? (
            <span className="warn">{props.micError}</span>
          ) : props.speaking ? (
            <span>主持人正在发言，麦克风暂停…</span>
          ) : props.listening ? (
            <span className="live">正在聆听，请直接说出指令</span>
          ) : (
            <span>点击麦克风开始聆听</span>
          )}
          {props.interim && <div className="interim">{props.interim}</div>}
          {!props.ttsSupported && <span className="warn">此浏览器不支持语音合成。</span>}
        </div>
      </div>

      <div className="text-input">
        <input
          value={text}
          placeholder="也可以直接输入，例如：下一个环节 / 说句祝福"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button type="button" className="primary" onClick={submit}>
          发送
        </button>
      </div>

      <div className="log" ref={logRef}>
        {props.log.length === 0 && <div className="log-empty">对话记录会显示在这里。</div>}
        {props.log.map((e) => (
          <div key={e.id} className={`bubble ${e.role}`}>
            <span className="who">{e.role === 'host' ? '主持人' : e.role === 'guest' ? '来宾' : '系统'}</span>
            <span className="msg">{e.text}</span>
          </div>
        ))}
        {props.thinking && (
          <div className="bubble host">
            <span className="who">主持人</span>
            <span className="msg dots">思考中</span>
          </div>
        )}
      </div>
      {props.log.length > 0 && (
        <button type="button" className="ghost small" onClick={props.onClearLog}>
          清空记录
        </button>
      )}
    </section>
  )
}
