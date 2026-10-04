import type { CeremonyStyle } from '../types'

export type Intent =
  | { type: 'start' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'repeat' }
  | { type: 'stop' }
  | { type: 'blessing' }
  | { type: 'intro' }
  | { type: 'agenda' }
  | { type: 'goto'; index: number }
  | { type: 'switchPersona'; personaId: string }
  | { type: 'switchStyle'; style: CeremonyStyle }
  | { type: 'ask'; field: 'groom' | 'bride' | 'date' | 'venue' | 'groomParents' | 'brideParents' | 'loveStory' }
  | { type: 'freeform'; text: string }

const normalize = (s: string) => s.replace(/[\s，。！？、,.!?]/g, '').toLowerCase()

const cnDigits: Record<string, number> = {
  一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
}

function parseOrdinal(text: string): number | null {
  const m = text.match(/第([一二两三四五六七八九十\d]+)/)
  if (!m) return null
  const raw = m[1]
  if (/^\d+$/.test(raw)) return Number(raw)
  if (raw === '十') return 10
  if (raw.length === 2 && raw[0] === '十') return 10 + (cnDigits[raw[1]] ?? 0)
  if (raw.length === 2 && raw[1] === '十') return (cnDigits[raw[0]] ?? 0) * 10
  return cnDigits[raw] ?? null
}

const personaKeywords: Array<[RegExp, string]> = [
  [/中式|传统|司仪|喜官/, 'chinese-classic'],
  [/西式|浪漫|grace/, 'western-romantic'],
  [/幽默|搞笑|轻松|阿乐/, 'humorous'],
  [/文艺|清新|诗意|青禾/, 'literary'],
  [/双语|英文|中西|国际|leo/, 'bilingual'],
]

export function parseIntent(input: string): Intent {
  const t = normalize(input)
  if (!t) return { type: 'freeform', text: input }

  if (/^(停|停止|暂停|安静|别说了|闭嘴|stop)$/.test(t) || /停一下|先停|暂停一下/.test(t)) return { type: 'stop' }
  if (/(再说一遍|重复|重来|再来一次|没听清)/.test(t)) return { type: 'repeat' }
  if (/(上一个|上一环节|上一步|返回|退回|回到上一)/.test(t)) return { type: 'prev' }

  const ordinal = parseOrdinal(t)
  if (ordinal && /(环节|步|项|个)/.test(t)) return { type: 'goto', index: ordinal - 1 }

  if (/(下一个|下一环节|下一步|继续|接着来|往下走|next)/.test(t)) return { type: 'next' }
  if (/(开始|开场|婚礼开始|可以开始了|start)/.test(t)) return { type: 'start' }

  if (/(切换|换成|换到|改成|换个|用).*(风格|主持|模式|司仪|式)|(风格|主持).*(切换|换)/.test(t) || /^(中式|西式|幽默|文艺|双语)$/.test(t)) {
    for (const [re, id] of personaKeywords) if (re.test(t)) return { type: 'switchPersona', personaId: id }
  }
  if (/(中式|西式|合璧|融合).*(流程|典礼)|(流程|典礼).*(中式|西式|合璧|融合)/.test(t)) {
    if (/合璧|融合/.test(t)) return { type: 'switchStyle', style: 'fusion' }
    if (/中式/.test(t)) return { type: 'switchStyle', style: 'chinese' }
    if (/西式/.test(t)) return { type: 'switchStyle', style: 'western' }
  }

  if (/(祝福|说句吉祥话|祝两句|祝贺|来句好话)/.test(t)) return { type: 'blessing' }
  if (/(自我介绍|你是谁|你叫什么|介绍一下你)/.test(t)) return { type: 'intro' }
  if (/(流程|有哪些环节|今天的安排|接下来有什么|议程)/.test(t)) return { type: 'agenda' }

  if (/新郎.*(父母|爸|妈)|(男方|公公|婆婆).*(是|叫)/.test(t)) return { type: 'ask', field: 'groomParents' }
  if (/新娘.*(父母|爸|妈)|(女方|岳父|岳母).*(是|叫)/.test(t)) return { type: 'ask', field: 'brideParents' }
  if (/新郎.*(叫|是谁|名字|姓)/.test(t)) return { type: 'ask', field: 'groom' }
  if (/新娘.*(叫|是谁|名字|姓)/.test(t)) return { type: 'ask', field: 'bride' }
  if (/(几号|日期|哪天|什么时候|今天是)/.test(t)) return { type: 'ask', field: 'date' }
  if (/(哪里|地点|地方|酒店|场地)/.test(t)) return { type: 'ask', field: 'venue' }
  if (/(怎么认识|爱情故事|恋爱|相识|怎么在一起)/.test(t)) return { type: 'ask', field: 'loveStory' }

  return { type: 'freeform', text: input }
}

export const voiceCommandHelp: Array<[string, string]> = [
  ['开始 / 下一个环节 / 上一个环节', '控制典礼流程'],
  ['第三个环节', '跳转到指定环节'],
  ['再说一遍', '重复当前环节'],
  ['暂停 / 停', '立即停止播报'],
  ['切换成西式风格 / 换成幽默主持', '切换主持人角色'],
  ['用中式流程 / 换中西合璧典礼', '切换典礼流程'],
  ['说句祝福', '即兴送上祝福'],
  ['新郎叫什么 / 在哪里举办 / 他们怎么认识的', '现场问答'],
  ['今天的流程是什么', '播报议程'],
]
