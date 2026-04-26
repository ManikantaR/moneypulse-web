# Inspiration

## Research Threads

### GitHub Awesome Copilot

- Use native customization surfaces instead of inventing ad hoc conventions: `.github/copilot-instructions.md`, `.github/instructions`, `.github/prompts`, `.github/agents`, `.github/skills`.
- Separate always-on rules from reusable prompts and from portable skills.
- Favor specialized agents with scoped tools and explicit handoffs.

Reference:

- [github/awesome-copilot](https://github.com/github/awesome-copilot)

### GitHub And VS Code Customization Docs

- Repository-wide instructions should stay broadly applicable and not task-specific.
- Path-specific instructions should carry framework or folder rules.
- Prompt files are for repeatable tasks; custom agents are for role/persona plus tool restrictions and handoffs; skills are for portable multi-step capabilities.

References:

- [GitHub repository custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)
- [VS Code custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [VS Code prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [VS Code agent skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

### Matt Pocock Skills

- Good skills are small, concrete, and explicit about when to use them.
- The `grill-me` skill is a useful model for design-pressure and branch-by-branch clarification.
- Skills work best when instructions are progressive and reference additional resources only when needed.

References:

- [mattpocock/skills](https://github.com/mattpocock/skills)
- [grill-me skill](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md)

### Andrej Karpathy

- Prefer first-principles reasoning, crisp abstractions, and strong educational structure.
- Specs should make hidden assumptions visible and reduce magic.

Reference:

- [karpathy.ai](https://karpathy.ai/)

### Burke Holland

- Agent systems should stay practical and developer-friendly rather than over-engineered.
- Workflow ergonomics matter as much as raw capability.

Reference:

- [Burke Holland](https://github.com/burkeholland)