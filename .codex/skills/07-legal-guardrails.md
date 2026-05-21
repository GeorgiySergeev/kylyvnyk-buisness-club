# Skill: Legal copy and forbidden vocabulary

## Why this matters

KCLUB is a private membership club, NOT:

- MLM / multi-level network
- Affiliate program
- Investment product
- Passive income scheme

Using the wrong vocabulary triggers:

- Stripe merchant review / account freeze
- Regulatory scrutiny (SEC, FCA, NBU for investment language)
- Brand damage

## Forbidden terms (machine-checked by CI)

```
MLM
multi-level
affiliate
referral commission
referral bonus
passive income
earnings
income guarantee
bonus per user
wallet
investment
guaranteed savings
ROI promise
crypto
gambling
casino
betting
adult
firearms
```

## How the CI check works

```bash
# pnpm vocab:check runs this:
grep -RInE \
  "MLM|affiliate|referral[ _-]?(commission|bonus)|passive[ _-]income|\
  wallet|crypto|gambling|casino|adult|firearms" \
  app/ src/ messages/ docs/ prompts/ || true
```

A match in any of those paths → CI fails → PR blocked.
`docs/GUARDRAILS.md` is the only exception (it documents the list).

## Allowed terms

| ✅ Use                | ❌ Instead of                         |
| --------------------- | ------------------------------------- |
| Business Introduction | referral, lead, affiliate             |
| Club membership       | subscription program                  |
| Membership benefits   | earnings, income                      |
| Verified partner      | affiliate partner                     |
| Recommend a client    | refer a client                        |
| Member                | affiliate, partner (in the MLM sense) |

## If you generate copy

Always ask: "Would this appear on an MLM landing page?"
If yes → rewrite.

## Footer legal copy

All legal copy lives in `messages/en/legal.json`.
Never hard-code legal text in components.
The footer disclaimer is already written:
"KCLUB is a private membership club. Not an MLM, investment, or financial product."

Do NOT paraphrase or "simplify" legal copy without explicit approval.
