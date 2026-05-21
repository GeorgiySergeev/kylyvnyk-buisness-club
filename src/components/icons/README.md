# Icons

- Use `Icon` for the approved Lucide subset: `<Icon name="Globe2" className="text-gold-400" />`.
- Add new Lucide names to the typed `ICONS` map in `icon.tsx`; do not use dynamic `any` casts.
- Brand icons live in `brand/` as TSX components and should use semantic CSS variables.
- Interactive icon-only controls still need a visible label via `aria-label`.
