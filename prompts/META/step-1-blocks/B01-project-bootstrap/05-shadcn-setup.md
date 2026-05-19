# 05-shadcn-setup.md

## Title

shadcn/ui Setup with Radix (dark + gold)

## Objective

Install shadcn/ui CLI and scaffold baseline UI components aligned with black & gold tokens.

## Steps

1) Install shadcn/ui CLI and init
2) Configure to use Tailwind and variables
3) Add base components (Button, Input, Label, Select, Dialog, Sheet, Card, Badge, Tabs, Separator, Tooltip)
4) Place components under src/components/ui

## Commands

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label select dialog sheet card badge tabs separator tooltip
```

## Acceptance

- Import paths like "@/components/ui/button" work
- Components respect dark theme; adjust classNames if needed to use gold accents
