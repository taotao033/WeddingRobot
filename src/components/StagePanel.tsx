import type { Persona, Segment } from '../types'

interface Props {
  persona: Persona
  segments: Segment[]
  index: number
  lines: string[]
  speaking: boolean
  started: boolean
  onStart: () => void
  onPrev: () => void
  onNext: () => void
  onRepeat: () => void
  onStop: () => void
  onGoto: (index: number) => void
  onBlessing: () => void
  onExport: () => void
}

export function StagePanel(props: Props) {
  const { persona, segments, index, lines, speaking, started } = props
  const segment = segments[index]
  const isLast = index >= segments.length - 1

  return (
    <section className="card stage">
      <header className="stage-header">
        <div className={`avatar ${speaking ? 'speaking' : ''}`} aria-hidden>
          <span>{persona.emoji}</span>
          <i className="ring" />
          <i className="ring delay" />
        </div>
        <div>
          <div className="stage-host">
            {persona.name} · {persona.title}
          </div>
          <div className="stage-progress">
            环节 {index + 1} / {segments.length}
          </div>
        </div>
        <button type="button" className="ghost" onClick={props.onExport} title="导出完整主持稿">
          导出主持稿
        </button>
      </header>

      <div className="segment-card">
        <div className="segment-title">{segment.title}</div>
        <div className="segment-cue">{segment.cue}</div>
        <div className="segment-lines">
          {lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      </div>

      <div className="controls">
        {!started ? (
          <button type="button" className="primary big" onClick={props.onStart}>
            开始典礼
          </button>
        ) : (
          <>
            <button type="button" onClick={props.onPrev} disabled={index === 0}>
              上一环节
            </button>
            <button type="button" onClick={props.onRepeat}>
              再说一遍
            </button>
            {speaking ? (
              <button type="button" className="danger" onClick={props.onStop}>
                停止播报
              </button>
            ) : (
              <button type="button" className="primary" onClick={props.onNext} disabled={isLast}>
                {isLast ? '已礼成' : '下一环节'}
              </button>
            )}
            <button type="button" className="ghost" onClick={props.onBlessing}>
              即兴祝福
            </button>
          </>
        )}
      </div>

      <ol className="agenda">
        {segments.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={i === index ? 'active' : i < index ? 'done' : ''}
              onClick={() => props.onGoto(i)}
            >
              <span className="agenda-num">{i + 1}</span>
              <span>{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
