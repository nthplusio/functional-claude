# OpenTUI Animation System

Timeline-based animation system for smooth property transitions.

## Overview

Animations in OpenTUI use:
- **Timeline**: Orchestrates multiple animations
- **Animation Engine**: Manages timelines and rendering
- **Easing Functions**: Control animation curves

## Basic Usage

### React

```tsx
import { useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

function AnimatedBox() {
  const [width, setWidth] = useState(0)

  const timeline = useTimeline({
    duration: 2000,
  })

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

  const timeline = useTimeline({
    duration: 2000,
  })

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

### Core

```typescript
import { createCliRenderer, Timeline, engine } from "@opentui/core"

const renderer = await createCliRenderer()
engine.attach(renderer)

const timeline = new Timeline({
  duration: 2000,
  autoplay: true,
})

timeline.add(
  { x: 0 },
  {
    x: 50,
    duration: 2000,
    ease: "easeOutQuad",
    onUpdate: (anim) => {
      box.setLeft(Math.round(anim.targets[0].x))
    },
  }
)

engine.addTimeline(timeline)
```

## Timeline Options

```typescript
const timeline = useTimeline({
  duration: 2000,         // Total duration in ms
  loop: false,            // Loop the timeline
  autoplay: true,         // Start automatically
  onComplete: () => {},   // Called when timeline completes
})
```

## Timeline Methods

```typescript
timeline.play()           // Start/resume
timeline.pause()          // Pause
timeline.restart()        // Restart from beginning
timeline.progress         // Current progress (0-1)
timeline.duration         // Total duration
```

## Animation Properties

```typescript
timeline.add(
  { value: 0 },           // Target object with initial values
  {
    value: 100,           // Final value
    duration: 1000,       // Animation duration in ms
    ease: "linear",       // Easing function
    delay: 0,             // Delay before starting
    onUpdate: (anim) => {
      const current = anim.targets[0].value
    },
    onComplete: () => {},
  },
  0                       // Start time in timeline (optional)
)
```

## Easing Functions

### Linear
- `linear` - Constant speed

### Quad (Power of 2)
- `easeInQuad` - Slow start
- `easeOutQuad` - Slow end
- `easeInOutQuad` - Slow start and end

### Cubic (Power of 3)
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`

### Quart (Power of 4)
- `easeInQuart`, `easeOutQuart`, `easeInOutQuart`

### Expo (Exponential)
- `easeInExpo`, `easeOutExpo`, `easeInOutExpo`

### Back (Overshoot)
- `easeInBack` - Pull back, then forward
- `easeOutBack` - Overshoot, then settle
- `easeInOutBack`

### Elastic
- `easeInElastic`, `easeOutElastic`, `easeInOutElastic`

### Bounce
- `easeInBounce`, `easeOutBounce`, `easeInOutBounce`

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

### Staggered Animation

```tsx
function StaggeredList({ items }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      count++
      setVisibleCount(count)
      if (count >= items.length) {
        clearInterval(interval)
      }
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

## Performance Tips

### Use Integer Values

Round animated values for character-based positioning:

```typescript
onUpdate: (anim) => {
  setX(Math.round(anim.targets[0].x))
}
```

### Clean Up Timelines

Hooks automatically clean up, but for core:

```typescript
engine.removeTimeline(timeline)
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

Terminal UIs typically refresh at 60 FPS max. Very fast animations may appear choppy.

### Character Grid

Animations are constrained to character cells. Sub-pixel positioning isn't possible.
