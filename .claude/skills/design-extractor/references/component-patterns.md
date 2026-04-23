# Component Patterns – Extraction Guide

## How to identify components

### React/Next.js
Look in: `components/`, `src/components/`, `app/components/`, `ui/`

Priority files:
- `Button.tsx`, `button.tsx`, `Button/index.tsx`
- `Card.tsx`, `Input.tsx`, `Modal.tsx`, `Badge.tsx`
- `Typography.tsx`, `Text.tsx`, `Heading.tsx`
- `Avatar.tsx`, `Chip.tsx`, `Tag.tsx`
- `Navbar.tsx`, `Sidebar.tsx`, `Footer.tsx`
- `Dialog.tsx`, `Toast.tsx`, `Alert.tsx`

### SwiftUI
Look in: `Views/`, `Components/`, `UI/`
- `ButtonView.swift`, `CardView.swift`
- All files with `View` suffix
- `Color+Extensions.swift`, `Font+Extensions.swift` (tokens!)

### HTML/CSS
Look in: root, `components/`, `partials/`
- Reusable sections with clear class names
- Repeated patterns across `.html` files

---

## What to extract per component

### Minimal documentation (required)
```
Component: Button
Variants: primary | secondary | ghost | destructive
Sizes: sm | md | lg
States: default | hover | disabled | loading
Tokens used: color.primary, spacing.4, radius.md, typography.button
```

### Reading variants from TSX

```tsx
// From this code:
const Button = ({ variant = 'primary', size = 'md', disabled }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-blue-600 text-blue-600',
    ghost: 'text-gray-600 hover:bg-gray-100'
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
}

// Extract:
// Name: Button
// Variants: primary (#3B82F6 bg), secondary (border), ghost
// Sizes: sm (px-3 py-1.5), md (px-4 py-2), lg (px-6 py-3)
```

---

## Standard components to always look for

| Component | Key props | Design tokens |
|-----------|-----------|---------------|
| Button | variant, size, disabled | color, spacing, radius, typography |
| Input/TextField | state (error, focus), size | color, border, spacing, typography |
| Card | elevation, padding | color, radius, shadow, spacing |
| Badge/Tag | color, size | color, typography, spacing, radius |
| Avatar | size, shape | color, spacing, radius |
| Modal/Dialog | size | color, shadow, radius, spacing |
| Toast/Alert | type (success/error/warn/info) | color, spacing, radius |
| Navigation | orientation, active state | color, typography, spacing |

---

## Tips for Claude Code

1. Scan all files in `components/` recursively
2. Prioritize files using `cva()` or `tv()` (class-variance-authority / tailwind-variants) — they define all variants explicitly
3. If the project uses `shadcn/ui`, document which components are installed
4. If Storybook exists (`*.stories.tsx`), extract stories as variant documentation
