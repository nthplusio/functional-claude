---
name: gemini-images
description: This skill should be used when the user asks to "generate image with gemini", "create icon", "nano-banana", "gemini image", "generate pattern", "create diagram with gemini", "app icon", "generate favicon", or wants to use the nano-banana Gemini CLI extension for image generation, icon creation, pattern design, or visual content.
version: 0.2.0
---

# Gemini Image Generation (nano-banana)

Generate images, icons, patterns, diagrams, and visual stories using the nano-banana extension for Gemini CLI.

## Prerequisites

1. **Gemini CLI** installed and authenticated
2. **API key** (required — OAuth alone is not sufficient for MCP extensions):
   ```bash
   export GEMINI_API_KEY="your-api-key"
   # or extension-specific:
   export NANOBANANA_GEMINI_API_KEY="your-api-key"
   ```
3. **nano-banana extension** installed:
   ```bash
   gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
   ```
4. **Restart Gemini CLI** after installation to activate commands

### Model Selection

**Always use the pro model by default.** Only fallback to flash if it errors or the user explicitly requests speed.

| Model | Role | Quality |
|-------|------|---------|
| `gemini-3-pro-image-preview` | **Default** — all image generation | Highest quality |
| `gemini-2.5-flash-image` | **Fallback** — on error or if user requests speed | Good quality, faster |

When invoking gemini for image tasks, **always prepend the model env var** to ensure the pro model is used:

```bash
# Default: pro model (always use this unless it fails)
NANOBANANA_MODEL=gemini-3-pro-image-preview gemini --yolo -p '/generate "your prompt"'

# Fallback: flash model (only on error or explicit user request)
NANOBANANA_MODEL=gemini-2.5-flash-image gemini --yolo -p '/generate "your prompt"'
```

If `NANOBANANA_MODEL` is already set in the environment, respect the user's choice. Only override if unset.

**Error handling:** If the pro model returns a quota/capacity/availability error, automatically retry with the flash model and inform the user which model produced the output.

### Headless Mode Permissions

nano-banana tools require explicit permission in headless mode. Use `--yolo` to auto-approve:

```bash
NANOBANANA_MODEL=gemini-3-pro-image-preview gemini --yolo -p '/generate "your prompt here"'
```

## Commands Reference

All nano-banana commands run inside a Gemini CLI session. From Claude Code, invoke them via headless mode or instruct the user to run them interactively.

**Important:** When executing any command below from Claude Code, always prepend the model and permissions:
```bash
NANOBANANA_MODEL=gemini-3-pro-image-preview gemini --yolo -p '<command>'
```
The examples below show the command portion only for brevity.

### /generate - Create Images

Create single or multiple images from text prompts.

```bash
# Basic generation
gemini -p '/generate "watercolor painting of a fox in a snowy forest"'

# Multiple variations
gemini -p '/generate "mountain landscape" --count=4'

# With artistic styles
gemini -p '/generate "city skyline" --styles="watercolor,oil-painting,sketch,photorealistic"'

# With variation types
gemini -p '/generate "portrait" --variations="lighting,angle,mood"'

# Grid output
gemini -p '/generate "abstract art" --count=4 --format=grid'

# Reproducible with seed
gemini -p '/generate "robot mascot" --seed=42 --count=3'
```

**Style options:** watercolor, oil-painting, sketch, photorealistic, anime, pixel-art, vintage, modern, abstract, minimalist

**Variation types:** lighting, angle, color-palette, composition, mood, season, time-of-day

### /icon - Generate App Icons & UI Elements

Create icons optimized for specific use cases with proper sizing.

```bash
# App icon set
gemini -p '/icon "coffee cup logo" --sizes="64,128,256,512" --type="app-icon"'

# Favicon
gemini -p '/icon "letter M monogram" --sizes="16,32,64" --type="favicon"'

# UI elements
gemini -p '/icon "settings gear" --sizes="24,48" --type="ui-element" --style="minimal"'

# With rounded corners (app store style)
gemini -p '/icon "music note" --sizes="128,256,512,1024" --type="app-icon" --corners="round"'

# Transparent background
gemini -p '/icon "chat bubble" --sizes="64,128" --background="transparent"'
```

**Icon types:** app-icon, favicon, ui-element

**Icon styles:** flat, skeuomorphic, minimal, modern

**Available sizes:** 16, 32, 64, 128, 256, 512, 1024

### /pattern - Seamless Patterns & Textures

Create tileable patterns for backgrounds and textures.

```bash
# Geometric pattern
gemini -p '/pattern "geometric triangles" --type="seamless" --style="geometric"'

# Organic texture
gemini -p '/pattern "marble texture" --type="texture" --style="organic" --size="512x512"'

# Wallpaper
gemini -p '/pattern "forest landscape" --type="wallpaper" --colors="duotone"'

# Dense tech pattern
gemini -p '/pattern "circuit board" --style="tech" --density="dense"'
```

**Pattern types:** seamless, texture, wallpaper

**Pattern styles:** geometric, organic, abstract, floral, tech

**Density:** sparse, medium, dense

**Color schemes:** mono, duotone, colorful

**Sizes:** 128x128, 256x256, 512x512

### /story - Sequential Visual Narratives

Generate series of images that tell a story or show a process.

```bash
# Process documentation
gemini -p '/story "seed growing into a tree" --steps=4 --type="process"'

# Tutorial steps
gemini -p '/story "making pour-over coffee" --steps=6 --type="tutorial"'

# Timeline
gemini -p '/story "evolution of web design 1995-2025" --steps=5 --type="timeline"'

# Comic layout
gemini -p '/story "a day in the life of a developer" --steps=4 --layout="comic"'
```

**Story types:** story, process, tutorial, timeline

**Layouts:** separate, grid, comic

**Transitions:** smooth, dramatic, fade

### /diagram - Technical Diagrams

Create technical visualizations and architectural diagrams.

```bash
# System architecture
gemini -p '/diagram "microservices e-commerce architecture" --type="architecture" --style="technical"'

# Flowchart
gemini -p '/diagram "user authentication flow" --type="flowchart" --layout="vertical"'

# Database schema
gemini -p '/diagram "social media database schema" --type="database" --complexity="detailed"'

# Network topology
gemini -p '/diagram "corporate network with DMZ" --type="network"'

# Wireframe
gemini -p '/diagram "mobile app settings page" --type="wireframe" --style="clean"'

# Mind map
gemini -p '/diagram "machine learning concepts" --type="mindmap" --complexity="comprehensive"'
```

**Diagram types:** flowchart, architecture, network, database, wireframe, mindmap, sequence

**Diagram styles:** professional, clean, hand-drawn, technical

**Layouts:** horizontal, vertical, hierarchical, circular

**Complexity:** simple, detailed, comprehensive

### /edit - Modify Existing Images

Edit images using natural language instructions.

```bash
# Edit an existing image
gemini -p '/edit "path/to/image.png" "change the sky to sunset colors"'

# Style transfer
gemini -p '/edit "photo.jpg" "convert to watercolor painting style"'
```

### /restore - Enhance & Repair Photos

Restore old or damaged photos.

```bash
gemini -p '/restore "old-family-photo.jpg"'
```

### /nanobanana - Natural Language Interface

Flexible natural language interface when specific commands don't fit.

```bash
gemini -p '/nanobanana "create a set of social media banners for a tech startup, 1200x630px"'
```

## Integration Patterns with Claude Code

### Generate Icons for a Project

```bash
# 1. Generate icon set
gemini -p '/icon "your app concept" --sizes="16,32,64,128,256,512,1024" --type="app-icon" --style="modern"'

# 2. Copy to project
cp ~/generated-icons/* public/icons/
```

### Create Diagrams for Documentation

```bash
# 1. Generate architecture diagram
gemini -p '/diagram "your system architecture" --type="architecture" --style="professional" --complexity="detailed"'

# 2. Move to docs
cp ~/generated-diagrams/* docs/images/
```

### Create Visual Assets for README

```bash
# Generate a hero image
gemini -p '/generate "developer workspace with code and coffee, tech illustration style" --styles="modern,minimalist"'

# Generate process diagrams
gemini -p '/story "how our CI/CD pipeline works" --steps=4 --type="process" --style="consistent"'
```

## File Management

nano-banana automatically:
- Generates descriptive filenames from prompts
- Prevents duplicate filenames
- Organizes output by command type

Generated files typically appear in:
- Current working directory, or
- `~/gemini-output/` (configurable)

## Tips

- **Be descriptive**: More detailed prompts produce better results
- **Use --preview**: Add `--preview` to auto-open generated images
- **Iterate**: Use `/edit` to refine generated images
- **Batch sizes**: `/icon` with multiple `--sizes` is more efficient than separate calls
- **Consistent style**: For sets, use `--seed` to maintain visual consistency
- **Pro model**: Set `NANOBANANA_MODEL=gemini-3-pro-image-preview` for highest quality output
