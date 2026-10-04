import type { LlmConfig } from '../types'
import { isLlmConfigured } from '../engine/llm'

interface Props {
  voices: SpeechSynthesisVoice[]
  voiceURI: string
  onVoiceChange: (uri: string) => void
  rateScale: number
  onRateScaleChange: (v: number) => void
  llm: LlmConfig
  onLlmChange: (c: LlmConfig) => void
  onTestVoice: () => void
}

export function SettingsPanel(props: Props) {
  const zhFirst = [...props.voices].sort((a, b) => {
    const az = a.lang.toLowerCase().startsWith('zh') ? 0 : 1
    const bz = b.lang.toLowerCase().startsWith('zh') ? 0 : 1
    return az - bz || a.name.localeCompare(b.name)
  })

  return (
    <details className="card settings">
      <summary className="card-title">高级设置</summary>

      <h3 className="card-subtitle">声音</h3>
      <label className="field">
        <span>系统语音</span>
        <select value={props.voiceURI} onChange={(e) => props.onVoiceChange(e.target.value)}>
          <option value="">自动（按角色推荐）</option>
          {zhFirst.map((v, i) => (
            <option key={`${v.voiceURI}-${i}`} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>语速 ×{props.rateScale.toFixed(2)}</span>
        <input
          type="range"
          min={0.6}
          max={1.5}
          step={0.05}
          value={props.rateScale}
          onChange={(e) => props.onRateScaleChange(Number(e.target.value))}
        />
      </label>
      <button type="button" className="ghost small" onClick={props.onTestVoice}>
        试听
      </button>

      <h3 className="card-subtitle">
        智能即兴（可选）
        <span className={`pill ${isLlmConfigured(props.llm) ? 'ok' : ''}`}>
          {isLlmConfigured(props.llm) ? '已启用' : '未配置 · 使用内置话术'}
        </span>
      </h3>
      <p className="hint">
        配置任意 OpenAI 兼容接口（OpenAI、DeepSeek、通义千问、Kimi、本地 Ollama 等），
        主持人即可回答自由提问并即兴发挥。密钥仅保存在本机浏览器。
      </p>
      <label className="field">
        <span>接口地址</span>
        <input value={props.llm.baseUrl} onChange={(e) => props.onLlmChange({ ...props.llm, baseUrl: e.target.value })} />
      </label>
      <label className="field">
        <span>模型</span>
        <input value={props.llm.model} onChange={(e) => props.onLlmChange({ ...props.llm, model: e.target.value })} />
      </label>
      <label className="field">
        <span>API Key</span>
        <input
          type="password"
          value={props.llm.apiKey}
          placeholder="sk-..."
          onChange={(e) => props.onLlmChange({ ...props.llm, apiKey: e.target.value })}
        />
      </label>
    </details>
  )
}
