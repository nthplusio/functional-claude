---
name: opentui-animation
description: This skill should be used when the user asks about OpenTUI animations, timelines, easing, transitions, or needs help creating animated effects in TUIs.
version: 0.1.1
---

# OpenTUI Animation System

Timeline-based animations for terminal interfaces.

## Basic Usage

### React

```tsx
import { useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

function AnimatedBox() {
  const [width, setWidth] = useState(0)

  const timeline = useTimeline({ duration: 2000 })

  useEffect(() => {
    timeline.add(
      { width: 0 },
      {
        width: 50,
        duration: 2000,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setWidth(Math.round(anim.targets[0].width))
        },
      }
    )
  }, [])

  return <box width={width} height={3} backgroundColor="#6a5acd" />
}
```

### Solid

```tsx
import { useTimeline } from "@opentui/solid"
import { createSignal, onMount } from "solid-js"

function AnimatedBox() {
  const [width, setWidth] = createSignal(0)

  const timeline = useTimeline({ duration: 2000 })

  onMount(() => {
    timeline.add(
      { width: 0 },
      {
        width: 50,
        duration: 2000,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setWidth(Math.round(anim.targets[0].width))
        },
      }
    )
  })

  return <box width={width()} height={3} backgroundColor="#6a5acd" />
}
```

## Timeline Options

```typescript
const timeline = useTimeline({
  duration: 2000,         // Total duration in ms
  loop: false,            // Loop the timeline
  autoplay: true,         // Start automatically
  onComplete: () => {},   // Called when complete
})
```

## Timeline Methods

```typescript
timeline.play()      // Start/resume
timeline.pause()     // Pause
timeline.restart()   // Restart from beginning
timeline.progress    // Current progress (0-1)
```

## Animation Properties

```typescript
timeline.add(
  { value: 0 },           // Initial value
  {
    value: 100,           // Final value
    duration: 1000,       // Duration in ms
    ease: "linear",       // Easing function
    delay: 0,             // Delay before starting
    onUpdate: (anim) => {
      const current = anim.targets[0].value
    },
    onComplete: () => {},
  },
  0                       // Start time (optional)
)
```

## Easing Functions

| Category | Functions |
|----------|-----------|
| Linear | `linear` |
| Quad | `easeInQuad`, `easeOutQuad`, `easeInOutQuad` |
| Cubic | `easeInCubic`, `easeOutCubic`, `easeInOutCubic` |
| Quart | `easeInQuart`, `easeOutQuart`, `easeInOutQuart` |
| Expo | `easeInExpo`, `easeOutExpo`, `easeInOutExpo` |
| Back | `easeInBack`, `easeOutBack`, `easeInOutBack` |
| Elastic | `easeInElastic`, `easeOutElastic`, `easeInOutElastic` |
| Bounce | `easeInBounce`, `easeOutBounce`, `easeInOutBounce` |

**Common choices:**
- `easeOutQuad` - Natural deceleration (great default)
- `easeOutCubic` - Stronger deceleration
- `easeInOutQuad` - Smooth start and end
- `easeOutBack` - Slight overshoot

## Patterns

### Progress Bar

```tsx
function ProgressBar({ progress }: { progress: number }) {
  const [width, setWidth] = useState(0)
  const maxWidth = 50

  const timeline = useTimeline()

  useEffect(() => {
    timeline.add(
      { value: width },
      {
        value: (progress / 100) * maxWidth,
        duration: 300,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setWidth(Math.round(anim.targets[0].value))
        },
      }
    )
  }, [progress])

  return (
    <box flexDirection="column" gap={1}>
      <text>Progress: {progress}%</text>
      <box width={maxWidth} height={1} backgroundColor="#333">
        <box width={width} height={1} backgroundColor="#00FF00" />
      </box>
    </box>
  )
}
```

### Spinner

```tsx
function Spinner() {
  const [frame, setFrame] = useState(0)
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length)
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return <text>{frames[frame]} Loading...</text>
}
```

### Staggered List

```tsx
function StaggeredList({ items }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      count++
      setVisibleCount(count)
      if (count >= items.length) clearInterval(interval)
    }, 100)
    return () => clearInterval(interval)
  }, [items.length])

  return (
    <box flexDirection="column">
      {items.slice(0, visibleCount).map((item, i) => (
        <text key={i}>{item}</text>
      ))}
    </box>
  )
}
```

### Slide In

```tsx
function SlideIn({ children, from = "left" }) {
  const [offset, setOffset] = useState(from === "left" ? -20 : 20)
  const timeline = useTimeline()

  useEffect(() => {
    timeline.add(
      { offset: from === "left" ? -20 : 20 },
      {
        offset: 0,
        duration: 300,
        ease: "easeOutCubic",
        onUpdate: (anim) => {
          setOffset(Math.round(anim.targets[0].offset))
        },
      }
    )
  }, [])

  return (
    <box position="relative" left={offset}>
      {children}
    </box>
  )
}
```

### Fade Effect (Opacity)

```tsx
function FadeIn({ children }) {
  const [opacity, setOpacity] = useState(0)
  const timeline = useTimeline()

  useEffect(() => {
    timeline.add(
      { opacity: 0 },
      {
        opacity: 1,
        duration: 500,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setOpacity(anim.targets[0].opacity)
        },
      }
    )
  }, [])

  return (
    <box style={{ opacity }}>
      {children}
    </box>
  )
}
```

## Performance Tips

### Use Integer Values

Round for character-based positioning:

```typescript
onUpdate: (anim) => {
  setX(Math.round(anim.targets[0].x))
}
```

### Clean Up Intervals

```tsx
useEffect(() => {
  const interval = setInterval(...)
  return () => clearInterval(interval)
}, [])
```

## Gotchas

### Terminal Refresh Rate

60 FPS max. Very fast animations may appear choppy.

### Character Grid

Animations constrained to character cells. No sub-pixel positioning.

## Detailed Reference

See `${CLAUDE_PLUGIN_ROOT}/skills/opentui-dev/references/animation-reference.md` for full documentation.
