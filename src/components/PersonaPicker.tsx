import type { CeremonyStyle, Persona } from '../types'
import { styleLabels } from '../data/flows'

interface Props {
  personas: Persona[]
  activeId: string
  style: CeremonyStyle
  onSelect: (id: string) => void
  onStyleChange: (style: CeremonyStyle) => void
}

export function PersonaPicker({ personas, activeId, style, onSelect, onStyleChange }: Props) {
  return (
    <section className="card">
      <h2 className="card-title">主持人角色</h2>
      <div className="persona-grid">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`persona ${p.id === activeId ? 'active' : ''}`}
            style={{ ['--p-accent' as string]: p.accent, ['--p-soft' as string]: p.accentSoft }}
            onClick={() => onSelect(p.id)}
            title={p.description}
          >
            <span className="persona-emoji" aria-hidden>
              {p.emoji}
            </span>
            <span className="persona-name">{p.name}</span>
            <span className="persona-title">{p.title}</span>
            <span className="persona-tagline">{p.tagline}</span>
          </button>
        ))}
      </div>

      <h3 className="card-subtitle">典礼流程</h3>
      <div className="segmented">
        {(Object.keys(styleLabels) as CeremonyStyle[]).map((s) => (
          <button key={s} type="button" className={s === style ? 'active' : ''} onClick={() => onStyleChange(s)}>
            {styleLabels[s]}
          </button>
        ))}
      </div>
    </section>
  )
}
