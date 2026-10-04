import type { Persona, Segment, WeddingInfo } from '../types'

const fallbacks: Record<keyof WeddingInfo, string> = {
  groom: '新郎',
  bride: '新娘',
  date: '今天',
  venue: '这里',
  groomParents: '',
  brideParents: '',
  loveStory: '',
  officiant: '',
}

export function render(template: string, info: WeddingInfo): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const k = key as keyof WeddingInfo
    const value = info[k]?.trim()
    return value || fallbacks[k] || ''
  })
}

export function renderLines(lines: string[], info: WeddingInfo): string[] {
  return lines.map((l) => render(l, info)).filter((l) => l.trim().length > 0)
}

export function scriptFor(persona: Persona, segment: Segment, info: WeddingInfo): string[] {
  const lines = persona.scripts[segment.id] ?? segment.defaultScript
  return renderLines(lines, info)
}

export function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function fullScriptText(persona: Persona, segments: Segment[], info: WeddingInfo): string {
  const header = [
    `${render('{{groom}} & {{bride}} 婚礼主持稿', info)}`,
    `主持风格：${persona.title}（${persona.name}）`,
    `日期：${info.date || '-'}    地点：${info.venue || '-'}`,
    '',
  ]
  const body = segments.flatMap((s, i) => [
    `${i + 1}. ${s.title}`,
    `   [提示] ${s.cue}`,
    ...scriptFor(persona, s, info).map((l) => `   ${l}`),
    '',
  ])
  return [...header, ...body].join('\n')
}
