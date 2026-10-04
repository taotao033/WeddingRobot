# 婚礼主持机器人 Wedding Host Bot

一个运行在浏览器里的婚礼主持机器人：多种主持人角色与语言风格、中式 / 西式 / 中西合璧典礼流程、
基于 Web Speech API 的语音播报与语音指令，可选接入大模型实现即兴互动。

## 功能

- **主持人角色（语言风格）**：喜官 · 中式传统｜Grace · 西式浪漫｜阿乐 · 轻松幽默｜青禾 · 文艺清新｜Leo · 中西合璧双语
- **典礼流程**：中式（三拜、敬茶改口、合卺酒…）、西式（入场、誓词、交换戒指、抛捧花…）、中西合璧；每个环节附带音乐 / 灯光 / 走位提示
- **语音交互**
  - 语音播报：按角色匹配系统中文语音、语速与音调
  - 语音指令：下一环节 / 上一环节 / 第 N 个环节 / 再说一遍 / 暂停 / 切换风格 / 切换流程 / 说句祝福 / 现场问答 / 播报议程
  - 主持人发言时自动暂停拾音，避免识别到自己的声音
  - 不支持麦克风的环境可直接输入文字
- **新人信息模板**：姓名、日期、地点、双方父母、爱情故事会自动填入所有话术
- **主持稿导出**：一键导出当前角色 + 流程的完整主持稿 `.txt`
- **智能即兴（可选）**：在"高级设置"中填入任意 OpenAI 兼容接口（OpenAI / DeepSeek / 通义千问 / Kimi / Ollama 等），
  自由提问与即兴发挥将由大模型按当前角色人设生成；未配置时使用内置话术兜底
- 所有设置保存在本机浏览器 `localStorage`，无后端

## 运行

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物在 dist/
npm run lint
```

建议使用 Chrome / Edge（语音识别依赖浏览器内置的 SpeechRecognition）。首次点击麦克风时需要允许麦克风权限。

## 目录结构

```
src/
  data/personas.ts     # 主持人角色：风格、语音参数、话术覆盖、LLM 人设
  data/flows.ts        # 中式 / 西式 / 融合典礼环节与默认话术
  engine/template.ts   # {{groom}} 等占位符渲染、主持稿导出
  engine/intents.ts    # 语音 / 文字指令意图解析
  engine/llm.ts        # OpenAI 兼容接口适配
  hooks/useSpeech.ts   # Web Speech API（TTS + STT）封装
  components/          # 角色选择、新人信息、舞台面板、语音控制台、高级设置
  App.tsx              # 状态编排与意图分发
```

## 扩展

- 新增角色：在 `src/data/personas.ts` 追加一个 `Persona`，只需覆盖想要个性化的环节，其余环节自动回退到默认话术
- 新增环节：在 `src/data/flows.ts` 对应流程里插入 `Segment`
- 新增指令：在 `src/engine/intents.ts` 增加正则 → `Intent`，并在 `App.tsx` 的 `handleIntent` 中处理
