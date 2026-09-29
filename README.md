# EH//LAB — Ethical Hacking, Interactive

An interactive study lab for the Ethical Hacking course: four chapters rebuilt as
interactive consoles, simulators and drills. Plain HTML/CSS/JS, no build step.

**Live:** https://vio137.github.io/eh-study/

## What's inside
- Ch.1 Foundations — interactive hacker-type map (permission x intent), flip-card vocabulary deck
- Ch.2 Method — scroll-driven 7-phase attack lifecycle with progress ring
- Ch.3 Pentest — 5-phase stepper, black/gray/white-box knowledge dial
- Ch.4 Nmap — animated TCP 3-way handshake (+ SYN-scan mode), port-state cards, live port-scanner simulator
- Checkpoints at the end of every chapter, a 63-question exam drill with got-it/missed tracking
  (localStorage), and the night-before cram page

## Develop
Serve the folder with any static server (`python3 -m http.server`) — content comes from
`assets/data/content.json`, figures from `assets/figures/`.

Practice only on systems you own or have written permission to test.
