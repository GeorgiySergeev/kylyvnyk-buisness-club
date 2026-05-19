# 03-tsconfig-path-aliases.md

## Title

TypeScript Path Aliases and Base TS Config

## Objective

Enable @/* alias, strict mode, and a small ambient type.

## Steps

1) Update tsconfig.json (baseUrl, paths, strict flags)
2) Add src/types/global.d.ts for SVG modules
3) Verify an import via "@/..."

## Files to modify/create

- tsconfig.json
- src/types/global.d.ts
- src/app/page.tsx (optional import demo)

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### src/types/global.d.ts

```ts
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
```

## Acceptance

- "@/..." imports compile
- Strict mode active
- Dev server runs
