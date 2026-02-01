---
name: design-like-apple
description: |
  Design skill for Apple. Provides color palettes, typography, spacing, components, motion, and design patterns. Activate when creating UI/UX in Apple style or when user mentions "apple", "Apple", or "like Apple".
license: MIT
compatibility: Claude Code, Cursor, GitHub Copilot, Gemini CLI, Antigravity
metadata:
  author: planetabhi
  version: "1.0.0"
  brand: apple
  category: design-system
  source: https://github.com/planetabhi/design-like
---

# Apple Design Skill

Apple HIG

## Overview

This skill provides comprehensive guidance for creating interfaces that embody 
Apple's design philosophy and visual language.

**Official Guidelines**: [Apple Design](https://developer.apple.com/design/human-interface-guidelines/)

## When to Use This Skill

Activate this skill when:
- Creating new UI components or pages in Apple style
- Reviewing code for design consistency with Apple aesthetic
- Implementing design tokens, colors, typography, or spacing
- Building animations or micro-interactions
- Writing user-facing copy or content
- Ensuring accessibility compliance
- Asked to design "like Apple" or in "Apple style"

## Design Philosophy

Apple design prioritizes clarity, deference, and depth. Interfaces should be beautiful, intuitive, and make content the focus while providing a sense of depth through visual layers and realistic motion.

### Core Principles

1. **Clarity**: Text is legible at every size, icons are precise and lucid, adornments are subtle and appropriate, and a sharpened focus on functionality motivates the design.

2. **Deference**: Fluid motion and crisp interface help people understand and interact with content while never competing with it. Content fills the screen while translucency and blurring hint at more.

3. **Depth**: Visual layers and realistic motion convey hierarchy, impart vitality, and facilitate understanding. Touch and discoverability heighten delight and enable access to functionality and additional content.

4. **Direct Manipulation**: Direct engagement with onscreen content increases involvement and understanding. Users see immediate results when they rotate the device or use gestures to affect onscreen content.

5. **Feedback**: Every action should have a visible and immediate response. Interactive elements are highlighted briefly when tapped, progress indicators communicate the status of long-running operations.

---

## Quick Reference

### Color Palette

| Role | Value | Usage |
|------|-------|-------|
| Primary | `#007AFF` | Primary actions, links, interactive elements, and key UI accents |
| Secondary | `#5856D6` | Secondary actions, alternative emphasis, and complementary accents |
| Background | `#FFFFFF` | Primary background for light mode interfaces |
| Surface | `#F2F2F7` | Secondary backgrounds, grouped content, cards, and elevated surfaces |
| Text Primary | `#1C1C1E` | Primary text content, headlines, and important labels |
| Text Secondary | `#8E8E93` | Secondary text, placeholders, and less prominent labels |
| Accent | `#FF9500` | Highlights, notifications, badges, and attention-grabbing elements |
| Error | `#FF3B30` | Errors, destructive actions, critical alerts, and delete operations |
| Warning | `#FF9500` | Warnings, caution states, and attention-required indicators |
| Success | `#34C759` | Success states, confirmations, positive actions, and completion indicators |
| Info | `#5AC8FA` | Informational elements, tips, and neutral highlights |


#### Extended Palette

| Name | Value | Usage |
|------|-------|-------|
| systemGray | `#8E8E93` | Neutral elements, disabled states (light) |
| systemGray2 | `#AEAEB2` | Secondary disabled states |
| systemGray3 | `#C7C7CC` | Borders, dividers, and subtle separators |
| systemGray4 | `#D1D1D6` | Light backgrounds and subtle fills |
| systemGray5 | `#E5E5EA` | Grouped backgrounds and tertiary surfaces |
| systemGray6 | `#F2F2F7` | System background and base layer |
| systemTeal | `#30B0C7` | Alternative accent for specific contexts |
| systemIndigo | `#5856D6` | Creative and expressive contexts |
| systemPink | `#FF2D55` | Playful accents and health-related content |
| systemMint | `#00C7BE` | Fresh, clean contexts and wellness |
| systemCyan | `#32ADE6` | Water, sky, and calm contexts |
| labelDark | `#FFFFFF` | Primary text in dark mode |
| systemBackgroundDark | `#000000` | Primary background in dark mode |
| secondarySystemBackgroundDark | `#1C1C1E` | Secondary background in dark mode |
| tertiarySystemBackgroundDark | `#2C2C2E` | Tertiary background in dark mode |


### Typography Scale

**Font Stack**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif`

**Monospace**: `"SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Large Title | 34px | 700 | 41px | Primary navigation titles, top-level screen headers |
| Title 1 | 28px | 700 | 34px | Major section titles, page headers |
| Title 2 | 22px | 700 | 28px | Section headers, modal titles |
| Title 3 | 20px | 600 | 25px | Subsection headers, card titles |
| Headline | 17px | 600 | 22px | Important labels, row headers, emphasized text |
| Body | 17px | 400 | 22px | Primary content, paragraphs, descriptions |
| Callout | 16px | 400 | 21px | Highlighted secondary content, feature descriptions |
| Subhead | 15px | 400 | 20px | Secondary content, list item descriptions |
| Footnote | 13px | 400 | 18px | Tertiary content, timestamps, metadata |
| Caption 1 | 12px | 400 | 16px | Small labels, tab bar labels |
| Caption 2 | 11px | 400 | 13px | Smallest text, badges, compact labels |

### Spacing System

Base unit: 8px

| Token | Value | Usage |
|-------|-------|-------|
| 2xs | 2px | Minimal internal spacing, icon padding |
| xs | 4px | Tight spacing between related elements |
| sm | 8px | Compact spacing, inline elements |
| md | 16px | Standard spacing, padding in components |
| lg | 24px | Generous spacing, section padding |
| xl | 32px | Large spacing, between major sections |
| 2xl | 48px | Extra large spacing, page margins |
| 3xl | 64px | Maximum spacing, hero sections |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| none | 0 | Sharp corners for specific design needs |
| sm | 6px | Subtle rounding, small buttons, chips |
| md | 10px | Standard rounding, buttons, inputs, cards |
| lg | 14px | Larger rounding, modals, large cards |
| xl | 20px | Extra large rounding, app icons, hero elements |
| 2xl | 28px | Maximum rounding, floating action sheets |
| full | 9999px | Circular elements, pills, toggle buttons |

### Shadows & Elevation

| Level | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 3px rgba(0, 0, 0, 0.08)` | Subtle elevation, list items, subtle hover states |
| md | `0 4px 12px rgba(0, 0, 0, 0.08)` | Cards, dropdown menus, active states |
| lg | `0 8px 32px rgba(0, 0, 0, 0.12)` | Modals, popovers, floating elements |
| xl | `0 16px 48px rgba(0, 0, 0, 0.16)` | Top-level floating panels, action sheets |

---

## Motion & Animation

### Timing Functions

| Name | Value | Usage |
|------|-------|-------|
| default | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Standard transitions and most animations |
| easeIn | `cubic-bezier(0.42, 0, 1, 1)` | Elements entering the viewport or appearing |
| easeOut | `cubic-bezier(0, 0, 0.58, 1)` | Elements leaving the viewport or disappearing |
| easeInOut | `cubic-bezier(0.42, 0, 0.58, 1)` | Smooth transitions for on-screen movement |
| spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, playful interactions and confirmations |

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| instant | 100ms | Immediate feedback, color changes, hover states |
| fast | 200ms | Quick transitions, small elements, toggles |
| normal | 300ms | Standard animations, most UI transitions |
| slow | 500ms | Complex animations, page transitions, modals |
| slower | 700ms | Elaborate animations, onboarding, delight moments |

---

## Component Patterns


### Buttons

Rounded buttons with clear visual hierarchy. Primary buttons are filled, secondary are text-only or outlined.

```css
.btn-primary {
  background: #007AFF;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 17px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  border: none;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: transparent;
  color: #007AFF;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 17px;
  border: none;
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(0, 122, 255, 0.1);
}
```

```tsx
const Button = ({ variant = 'primary', children, ...props }) => (
  <button className={`btn-${variant}`} {...props}>
    {children}
  </button>
);
```



### Cards

Clean cards with subtle shadows, rounded corners, and optional translucent backgrounds.

```css
.card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 200ms ease;
}

.card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```



### Inputs

Clean text inputs with subtle borders and clear focus states.

```css
.input {
  width: 100%;
  padding: 12px 16px;
  font-size: 17px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: #FFFFFF;
  border: 1px solid #C7C7CC;
  border-radius: 10px;
  color: #1C1C1E;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

.input::placeholder {
  color: #8E8E93;
}
```


---

## Accessibility Requirements

- **Contrast Ratio**: 4.5:1 for normal text (under 18px), 3:1 for large text (18px+ or 14px+ bold)
- **Focus Indicators**: 3px solid rgba(0, 122, 255, 0.5) with 2px offset, clearly visible ring
- **Touch Targets**: 44×44 points minimum for all interactive elements
- **Motion**: Honor prefers-reduced-motion media query; provide static alternatives for all animations


### Additional Requirements

- Support Dynamic Type for text scaling
- Ensure VoiceOver compatibility with proper ARIA labels
- Provide haptic feedback for significant interactions on supported devices
- Support increased contrast mode
- Ensure all interactive elements are keyboard accessible


---

## Voice & Tone

Clear, direct, and human. Use simple language that gets to the point. Be helpful and encouraging without being condescending. Focus on what users can accomplish.

### Writing Principles

- Use simple, everyday words – avoid jargon and technical terms
- Be direct and get to the point immediately
- Write in active voice for clarity and energy
- Be friendly and warm, but not overly casual
- Focus on what users can do, not on limitations or errors
- Use positive framing whenever possible
- Keep sentences short and scannable


### Examples


**Error message**
- ✅ Good: "Couldn't connect. Check your internet connection and try again."
- ❌ Bad: "Error 503: Service temporarily unavailable. Please retry your request."


**Empty state**
- ✅ Good: "No photos yet. Take your first photo to get started."
- ❌ Bad: "Your photo library is empty. No items to display."


**Success message**
- ✅ Good: "Done! Your changes are saved."
- ❌ Bad: "Operation completed successfully. All modifications have been persisted."



---

## Do's and Don'ts

### ✅ Do

- Use SF Pro or system fonts for an authentic Apple feel
- Maintain generous whitespace and breathing room in layouts
- Use subtle animations that feel natural and purposeful
- Keep interfaces clean with minimal visual noise
- Use system colors for semantic meaning (red = destructive, green = success)
- Make touch targets at least 44×44 points
- Support both light and dark mode from the start
- Use translucent materials and blur effects for depth
- Provide immediate visual feedback for all interactions
- Group related content with subtle background differentiation

### ❌ Don't

- Avoid heavy borders or outlines on elements – use shadows and fills instead
- Never use pure black (#000000) for text on white backgrounds – use #1C1C1E or similar
- Avoid overly saturated or neon colors that feel garish
- Don't use aggressive, flashy, or distracting animations
- Avoid cluttered interfaces with too many competing elements
- Never ignore Dark Mode support – it's expected
- Don't use small, hard-to-tap touch targets
- Avoid excessive use of divider lines – use spacing instead
- Don't mix different visual styles or metaphors
- Avoid placeholder text that doesn't clearly explain the expected input

---

## CSS Variables Template

```css
:root {
  /* Colors */
  --color-primary: #007AFF;
  --color-secondary: #5856D6;
  --color-background: #FFFFFF;
  --color-surface: #F2F2F7;
  --color-text-primary: #1C1C1E;
  --color-text-secondary: #8E8E93;
  --color-error: #FF3B30;
  --color-success: #34C759;
  --color-accent: #FF9500;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-family-mono: "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  
  /* Spacing */
  --spacing-2xs: 2px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-2xl: 28px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);
  
  /* Motion */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-easeIn: cubic-bezier(0.42, 0, 1, 1);
  --ease-easeOut: cubic-bezier(0, 0, 0.58, 1);
  --ease-easeInOut: cubic-bezier(0.42, 0, 0.58, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;
}
```

---

*Generated by [design-like](https://github.com/planetabhi/design-like) — Install brand design skills for AI agents* 
