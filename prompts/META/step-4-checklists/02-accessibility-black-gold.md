# step-4-checklists/02-accessibility-black-gold.md

## Title

Accessibility — black & gold (WCAG 2.1 AA)

## Colours/Contrast

- [ ] Текст на темном фоне (bg/card): контраст ≥ AA (обычно > 4.5:1).
- [ ] Gold‑accent только для коротких надписей/иконок; длинные абзацы — текст fg.
- [ ] На золотом фоне — текст fgOnGold (темный), чтобы обеспечить контраст.

## Keyboard/Focus

- [ ] Все интерактивные элементы — фокусируемые; видимый focus ring (focus-gold).
- [ ] Меню/диалоги/шиты — управляемы с клавиатуры (Esc, Tab циклы).
- [ ] Порядок табуляции логичен; не скрывать outline.

## Forms

- [ ] Label связан с input (htmlFor / id).
- [ ] aria-describedby связывает helper/error.
- [ ] Ошибки — текстом и цветом (не только цвет), role="alert"/status где уместно.
- [ ] Размеры полей и кнопок ≥ 44px по высоте (mobile targets).

## Structure/Semantics

- [ ] Иерархия заголовков h1→h2→h3 последовательна.
- [ ] SR‑only текст для описания иконок/логотипа при необходимости.
- [ ] Язык документа (html lang="en" по умолчанию).

## Motion/Flashing

- [ ] Нет резких анимаций; ограничить motion по prefers-reduced-motion.
- [ ] Отсутствуют мигающие элементы.

## Testing

- [ ] axe DevTools / Lighthouse Accessibility ≥ 95.
- [ ] eslint-plugin-jsx-a11y (включен) — без ошибок.
- [ ] Тест клавиатурой: табом пройти шапку/меню/CTA/формы.

Пример SR‑only

```css
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
```

## Acceptance

- [ ] Контраст AA выполнен (вкл. на gold фонах).
- [ ] Фокус видим везде; элементы кликабельны с клавиатуры.
- [ ] Формы корректно озвучиваются скринридером.
- [ ] Axe/Lighthouse Accessibility passed.
