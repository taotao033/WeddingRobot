import type { WeddingInfo } from '../types'

interface Props {
  info: WeddingInfo
  onChange: (info: WeddingInfo) => void
}

const fields: Array<{ key: keyof WeddingInfo; label: string; placeholder: string; multiline?: boolean }> = [
  { key: 'groom', label: '新郎', placeholder: '例如：李明' },
  { key: 'bride', label: '新娘', placeholder: '例如：王雪' },
  { key: 'date', label: '日期', placeholder: '例如：2026 年 10 月 18 日' },
  { key: 'venue', label: '地点', placeholder: '例如：杭州西子湖四季酒店' },
  { key: 'groomParents', label: '新郎父母', placeholder: '例如：李建国先生、张芳女士' },
  { key: 'brideParents', label: '新娘父母', placeholder: '例如：王海先生、刘丽女士' },
  { key: 'loveStory', label: '爱情故事', placeholder: '相识、相恋的简短故事，用于现场问答与即兴发挥', multiline: true },
]

export function WeddingForm({ info, onChange }: Props) {
  return (
    <section className="card">
      <h2 className="card-title">新人信息</h2>
      <div className="form-grid">
        {fields.map((f) => (
          <label key={f.key} className={`field ${f.multiline ? 'full' : ''}`}>
            <span>{f.label}</span>
            {f.multiline ? (
              <textarea
                rows={3}
                value={info[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => onChange({ ...info, [f.key]: e.target.value })}
              />
            ) : (
              <input
                value={info[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => onChange({ ...info, [f.key]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
    </section>
  )
}
