# Transcripts

Raw Claude Code session logs (JSONL, one event per line), copied from `~/.claude/projects/`. Home paths, the local username and the account email are replaced with `~`, `user` and `<user-email>`.

| File | Session |
|---|---|
| `00-coordinator.jsonl` | Coordinator: design, briefs, herdr orchestration, merges, reviews, README. Snapshot taken just before the last transcripts commit, so the final commit and push are missing. |
| `01-part1-skeleton.jsonl` | Part 1 agent (herdr, `feat/skeleton` worktree). |
| `02-backend-agent.jsonl` | Backend agent (herdr): Part 2 backend, Part 3 backend polish, review fixes. |
| `03-frontend-agent.jsonl` | Frontend agent (herdr): Part 2 frontend, Part 3 e2e and UI pass, review fixes. |
| `subagent-b2a1a2d3-*.jsonl` | Subagents launched by the coordinator: the design builder-check, the first Part 1 attempt (stopped and handed to the herdr agent), three read-only review audits, the final UI review, dropping EF migrations, removing doc-pointer comments, and the e2e flake investigation. |
| `subagent-0001f6f8-*.jsonl` | Subagent launched by the Part 1 agent. |
