import type { CeremonyStyle, Segment } from '../types'

const chinese: Segment[] = [
  {
    id: 'opening',
    title: '开场致辞',
    cue: '音乐起 · 灯光全亮 · 宾客入席',
    defaultScript: [
      '各位来宾，各位亲朋好友，大家好。',
      '今天是{{date}}，我们相聚在{{venue}}，共同见证{{groom}}先生与{{bride}}女士的大喜之日。',
      '请大家入座，婚礼即将开始。',
    ],
  },
  {
    id: 'entrance',
    title: '新人入场',
    cue: '入场音乐 · 追光灯 · 花童撒花',
    defaultScript: [
      '现在，让我们以最热烈的掌声，有请今天的新郎{{groom}}、新娘{{bride}}闪亮登场。',
    ],
  },
  {
    id: 'bows',
    title: '三拜之礼',
    cue: '礼乐 · 新人立于高堂前',
    defaultScript: [
      '一拜天地，感恩天地，赐良缘。',
      '二拜高堂，感恩父母，养育恩。',
      '夫妻对拜，相敬如宾，百年好合。',
    ],
  },
  {
    id: 'tea',
    title: '敬茶改口',
    cue: '奉茶 · 父母就座 · 准备改口红包',
    defaultScript: [
      '一杯清茶，敬的是养育之恩，道的是儿女之心。',
      '请新人向双方父母敬茶，从今天起，一声爸妈，两家变一家。',
    ],
  },
  {
    id: 'tokens',
    title: '交换信物',
    cue: '礼盒上台 · 近景特写',
    defaultScript: [
      '信物为凭，情定终生。请新人交换信物。',
      '愿这份信物，见证你们携手走过的每一个春夏秋冬。',
    ],
  },
  {
    id: 'parents',
    title: '父母致辞',
    cue: '话筒递父母 · 灯光柔和',
    defaultScript: [
      '此刻，最想说话的，一定是把孩子养大的父母。有请新郎的父母{{groomParents}}，新娘的父母{{brideParents}}，为新人送上祝福。',
    ],
  },
  {
    id: 'wine',
    title: '合卺交杯',
    cue: '斟酒 · 新人相对而立',
    defaultScript: [
      '合卺酒，一杯同心，一生同行。',
      '请新人共饮此杯，从此甘苦与共，白首不离。',
    ],
  },
  {
    id: 'toast',
    title: '敬酒答谢',
    cue: '开席 · 新人逐桌敬酒',
    defaultScript: [
      '接下来，新人将逐桌向各位来宾敬酒答谢。请大家举杯，共祝新人新婚快乐。',
    ],
  },
  {
    id: 'closing',
    title: '礼成',
    cue: '礼成音乐 · 全场掌声 · 合影',
    defaultScript: [
      '良缘天定，佳偶天成。{{groom}}与{{bride}}的婚礼，礼成。',
      '感谢各位来宾的光临与见证，祝大家幸福安康，万事如意。',
    ],
  },
]

const western: Segment[] = [
  {
    id: 'opening',
    title: '开场致辞',
    cue: 'Prelude · 宾客就座 · 灯光柔和',
    defaultScript: [
      '亲爱的各位来宾，欢迎来到{{venue}}。',
      '今天，{{date}}，我们在这里见证{{groom}}与{{bride}}的爱情，走向婚姻的殿堂。',
    ],
  },
  {
    id: 'groom-entrance',
    title: '新郎入场',
    cue: '新郎与伴郎入场 · 立于台前',
    defaultScript: ['请大家把目光投向通道，有请我们的新郎{{groom}}入场。'],
  },
  {
    id: 'bride-entrance',
    title: '新娘入场',
    cue: '婚礼进行曲 · 全体起立 · 父亲牵手交付',
    defaultScript: [
      '请全体来宾起立。',
      '此刻，新娘{{bride}}将在父亲的陪伴下，走向她的爱人。',
      '请新郎上前，从父亲手中接过他此生最珍贵的托付。请大家就座。',
    ],
  },
  {
    id: 'vows',
    title: '爱的誓言',
    cue: '新人相对而立 · 近景 · 话筒',
    defaultScript: [
      '{{groom}}，你是否愿意娶{{bride}}为妻，无论顺境或逆境，富有或贫穷，健康或疾病，都爱她、尊重她、守护她，直到永远？',
      '{{bride}}，你是否愿意嫁给{{groom}}为夫，无论顺境或逆境，富有或贫穷，健康或疾病，都爱他、尊重他、守护他，直到永远？',
    ],
  },
  {
    id: 'rings',
    title: '交换戒指',
    cue: '戒童上台 · 特写',
    defaultScript: [
      '戒指是一个圆，没有起点也没有终点，正如你们的爱。',
      '请新人为彼此戴上戒指。',
    ],
  },
  {
    id: 'pronounce',
    title: '宣布成婚',
    cue: '礼花 · 音乐高潮',
    defaultScript: [
      '凭借爱与承诺的力量，我在此宣布：你们正式结为夫妻。',
      '新郎，现在你可以亲吻你的新娘了。',
    ],
  },
  {
    id: 'parents',
    title: '父母致辞',
    cue: '话筒递父母 · 灯光柔和',
    defaultScript: [
      '让我们有请新郎的父母{{groomParents}}，以及新娘的父母{{brideParents}}，为这对新人送上来自家人的祝福。',
    ],
  },
  {
    id: 'cake',
    title: '切蛋糕 · 香槟塔',
    cue: '蛋糕推上台 · 香槟倒塔',
    defaultScript: [
      '甜蜜的蛋糕，象征共享生活的甘甜；层层香槟，寓意幸福满溢。请新人共同切下第一刀，开启香槟塔。',
    ],
  },
  {
    id: 'bouquet',
    title: '抛捧花',
    cue: '单身来宾上台 · 背身抛花',
    defaultScript: [
      '最浪漫的时刻来了，请所有单身的朋友上台。谁接到这束花，谁就是下一位幸运儿。三、二、一！',
    ],
  },
  {
    id: 'closing',
    title: '礼成',
    cue: '退场音乐 · 新人退场 · 合影',
    defaultScript: [
      '女士们先生们，让我们再次用掌声祝福{{groom}}与{{bride}}。愿你们的爱情，如今日般明亮，直到永远。婚礼礼成。',
    ],
  },
]

const fusion: Segment[] = [
  chinese[0],
  western[1],
  western[2],
  western[3],
  western[4],
  chinese[3],
  western[6],
  chinese[6],
  western[7],
  chinese[8],
]

export const flows: Record<CeremonyStyle, Segment[]> = { chinese, western, fusion }

export const styleLabels: Record<CeremonyStyle, string> = {
  chinese: '中式典礼',
  western: '西式典礼',
  fusion: '中西合璧',
}
