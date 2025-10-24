# CompanionX

A cozy web-based companion experience featuring Aiko, a charming anime-style cat
lady who keeps you company and responds playfully to your messages.

## Features

- **Hand-crafted companion avatar** – Aiko is rendered with a custom SVG
  illustration that matches the anime cat-lady vibe with warm tones and a swishing
  tail.
- **Dynamic reactions** – The avatar floats, sways, and reacts to pointer
  movement, mood buttons, and chat interactions in real-time.
- **Interactive chat** – Share thoughts inside the chat window and enjoy canned
  responses that adapt to your mood selections.
- **Creator console** – Log in with creator credentials to unlock premium tuning
  controls, including avatar sway intensity and the greeting headline.
- **Session persistence** – Your role and creator preferences stay intact across
  reloads using local storage.

## Getting started

1. Serve the project using any static file host (for example
   `python3 -m http.server 8000`).
2. Visit `http://localhost:8000` in your browser.
3. Use the creator login (`creator@companionx.app` / `starlight`) to access
   premium tools, or continue as a guest.

## Project structure

```
.
├── assets/
│   └── avatar.svg
├── index.html
├── scripts/
│   └── app.js
└── styles/
    └── main.css
```
