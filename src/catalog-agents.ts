export type Agent = {
  name: string
  description: string
  /** Where the agent lives. Used for the link and for its favicon. */
  url: string
  domain: string
}

/** The agents that read Agent Skills, and what each one does with them. */
export const agents: Agent[] = [
  {
    name: 'Claude Code',
    description: "Anthropic's official terminal agent. Skills installed via the skills CLI become available as procedural knowledge across every Claude Code session in the project.",
    url: 'https://claude.com/code',
    domain: 'claude.com',
  },
  {
    name: 'Cursor',
    description: 'AI-first code editor with deep agent integration. The skills CLI installs SKILL.md files so Cursor can reference them automatically across repo sessions.',
    url: 'https://cursor.com',
    domain: 'cursor.com',
  },
  {
    name: 'Codex',
    description: "OpenAI's coding agent. Compatible with the skills CLI for installing reusable procedural knowledge: performance rules, design systems, and workflow patterns.",
    url: 'https://openai.com/codex',
    domain: 'openai.com',
  },
  {
    name: 'GitHub Copilot',
    description: "GitHub's AI coding assistant. Skills installed by the skills CLI augment Copilot's project context with structured guidance the model uses across edits and chats.",
    url: 'https://github.com/features/copilot',
    domain: 'github.com',
  },
  {
    name: 'Windsurf',
    description: "Codeium's agentic IDE. Skills give Windsurf project-specific procedural knowledge that persists across sessions without manual re-prompting.",
    url: 'https://windsurf.dev',
    domain: 'windsurf.dev',
  },
  {
    name: 'Gemini',
    description: "Google's Gemini family of agents. Compatible with the skills CLI for repo-scoped skill installation, including the Gemini CLI for terminal workflows.",
    url: 'https://gemini.google.com',
    domain: 'gemini.google.com',
  },
  {
    name: 'Cline',
    description: 'Open-source autonomous coding agent for VS Code. Reads SKILL.md files installed by the skills CLI to apply project-specific patterns automatically.',
    url: 'https://cline.bot',
    domain: 'cline.bot',
  },
  {
    name: 'AMP',
    description: 'AMP is a research agent that uses the skills CLI to load procedural knowledge for engineering, design, and operational tasks.',
    url: 'https://ampcode.com',
    domain: 'ampcode.com',
  },
  {
    name: 'Antigravity',
    description: "Google's developer agent platform. Skills installed by the skills CLI extend Antigravity sessions with reusable, project-scoped guidance.",
    url: 'https://antigravity.google',
    domain: 'antigravity.google',
  },
  {
    name: 'OpenClaw',
    description: 'OpenClaw supports the skills CLI for installing reusable procedural knowledge across agent sessions.',
    url: 'https://openclaw.ai',
    domain: 'openclaw.ai',
  },
  {
    name: 'Droid',
    description: "Factory's autonomous engineering agent. Compatible with the skills CLI for installing skills that Droid loads into its project context.",
    url: 'https://factory.ai',
    domain: 'factory.ai',
  },
  {
    name: 'Goose',
    description: "Block's open-source on-machine agent. Skills installed by the skills CLI extend Goose with reusable extensions and procedural guidance.",
    url: 'https://block.github.io/goose',
    domain: 'block.github.io',
  },
  {
    name: 'Kilo',
    description: 'Kilo is an AI coding agent that supports the skills CLI for installing project-scoped capabilities.',
    url: 'https://kilocode.ai',
    domain: 'kilocode.ai',
  },
  {
    name: 'Kiro CLI',
    description: "Kiro's terminal agent. Compatible with the skills CLI for installing SKILL.md-based knowledge across sessions.",
    url: 'https://kiro.dev',
    domain: 'kiro.dev',
  },
  {
    name: 'Nous Research',
    description: 'Nous Research builds and ships open agents. Their tooling supports the skills CLI for installing reusable procedural knowledge.',
    url: 'https://nousresearch.com',
    domain: 'nousresearch.com',
  },
  {
    name: 'OpenCode',
    description: 'OpenCode is an open-source AI coding agent that integrates with the skills CLI for repo-scoped skill installation.',
    url: 'https://opencode.ai',
    domain: 'opencode.ai',
  },
  {
    name: 'Roo',
    description: 'Roo Code is an autonomous coding agent with skills CLI compatibility for project-scoped guidance.',
    url: 'https://roocode.com',
    domain: 'roocode.com',
  },
  {
    name: 'Trae',
    description: 'Trae is an AI coding agent that supports the skills CLI for installing reusable knowledge across sessions.',
    url: 'https://trae.ai',
    domain: 'trae.ai',
  },
  {
    name: 'VS Code',
    description: "Visual Studio Code's GitHub Copilot Chat and agent features support the skills CLI for installing project-scoped procedural knowledge.",
    url: 'https://code.visualstudio.com',
    domain: 'code.visualstudio.com',
  },
  {
    name: 'Zed',
    description: 'Rust-based code editor with a built-in agent panel and native parallel agents. The skills CLI installs SKILL.md files that Zed references automatically when working on the repo.',
    url: 'https://zed.dev',
    domain: 'zed.dev',
  },
  {
    name: 'Augment',
    description: "Augment Code's coding agent, available through Auggie CLI and editor integrations. Auggie supports Agent Skills for reusable project guidance, code reviews, and development workflows.",
    url: 'https://augmentcode.com',
    domain: 'augmentcode.com',
  },
  {
    name: 'Junie',
    description: "JetBrains' coding agent for terminal and IDE workflows. Junie CLI loads project and personal skills to apply reusable instructions, team conventions, and task-specific procedures.",
    url: 'https://www.jetbrains.com/junie/',
    domain: 'jetbrains.com',
  },
  {
    name: 'Warp',
    description: 'An agentic development environment with terminal, CLI, and cloud agents. Warp discovers reusable skills for coding tasks, reviews, and team workflows from project and global skill directories.',
    url: 'https://warp.dev',
    domain: 'warp.dev',
  },
  {
    name: 'Devin CLI',
    description: "Cognition's local coding agent for terminal workflows, with handoff to cloud Devin. Skills package reusable prompts and procedures that you or the agent can invoke during development.",
    url: 'https://devin.ai',
    domain: 'devin.ai',
  },
  {
    name: 'Mistral Vibe',
    description: "Mistral's open-source command-line coding assistant. It reads and edits code, runs commands, and follows the Agent Skills specification for reusable instructions and custom slash commands.",
    url: 'https://github.com/mistralai/mistral-vibe',
    domain: 'mistral.ai',
  },
  {
    name: 'Qwen Code',
    description: 'An open-source coding agent with terminal and editor integrations. Qwen Code discovers SKILL.md instructions for project conventions, development workflows, and specialized tasks.',
    url: 'https://github.com/QwenLM/qwen-code',
    domain: 'qwenlm.github.io',
  },
  {
    name: 'Kimi Code CLI',
    description: "Moonshot AI's open-source terminal coding agent. It reads and edits files, runs commands, and loads project or personal skills automatically or through explicit skill commands.",
    url: 'https://github.com/MoonshotAI/kimi-cli',
    domain: 'moonshot.ai',
  },
  {
    name: 'Pi',
    description: 'An open-source terminal coding agent that supports the Agent Skills specification. Pi discovers skill descriptions at startup and loads them into context.',
    url: 'https://github.com/badlogic/pi-mono',
    domain: 'github.com',
  },
]
