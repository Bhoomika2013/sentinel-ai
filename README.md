# 🛡️ Sentinel AI

### AI-Powered Governance & Risk Assessment for Financial AI Agents

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge)](https://sentinel-ai-dsx8.onrender.com)

Sentinel AI is a governance and security system designed to control and monitor autonomous AI agents performing financial actions.

It acts as a **security checkpoint between AI agents and financial operations**, evaluating requests before they are approved, blocked, or sent for human review.

---

## 🎯 Problem

As AI agents become capable of making financial decisions and performing transactions autonomously, unrestricted access can introduce risks such as:

- Unauthorized financial actions
- Excessive spending
- High-risk transactions
- Lack of human oversight
- Poor visibility into agent decisions

Sentinel AI addresses these risks by introducing a governance layer around AI-driven financial actions.

---

## 💡 Solution

Sentinel AI evaluates financial requests made by AI agents using multiple governance controls:

- 🔐 **Permission Engine** — Controls what each agent is allowed to do
- 💰 **Dynamic Spend Cap** — Prevents agents from exceeding configured limits
- ⚠️ **Risk Assessment** — Evaluates the risk associated with requests
- 👤 **Human Review** — Allows high-risk requests to be reviewed by humans
- 📋 **Audit Logs** — Maintains a record of system activities and decisions
- 📊 **Analytics Dashboard** — Provides visibility into agent activity and risk

---

## 🏗️ How It Works

```text
                 AI Agent
                    │
                    ▼
             Financial Request
                    │
                    ▼
          ┌─────────────────────┐
          │     Sentinel AI     │
          │                     │
          │  Permission Check   │
          │         ↓           │
          │   Risk Assessment   │
          │         ↓           │
          │   Spend Limit Check │
          └─────────┬───────────┘
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       APPROVE    BLOCK     REVIEW
          │                   │
          │                   ▼
          │             Human Approval
          │                   │
          └─────────┬─────────┘
                    ▼
                Audit Log
