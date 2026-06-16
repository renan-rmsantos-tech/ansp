# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Design artifacts for **Arca Nossa Senhora da Providência (ANSP)** — the nonprofit association (mantenedora) behind Colégio São José / ACIPEC / FSSPX in Itatiba-SP. The project is a scholarship application system ("Solicitação de Bolsa para Família Necessitada") for the 2026 school year.

Currently in **design phase**: static HTML mockups and brand documentation. No framework, no build step, no server.

## Repository Structure

- `design/` — Self-contained HTML prototypes (open directly in browser)
  - `design-system.html` — Component catalog and token reference
  - `formulario.html` — Public-facing scholarship application form
  - `admin.html` — Admin panel for reviewing/managing applications
  - `login.html` — Authentication screen
  - `logo-gesso.jpg`, `base1.png`, `base2.png` — Logo assets (base1 = Our Lady painting for SVG seal)
- `docs/` — Reference materials
  - `brand-spec.md` — Canonical brand spec (palette, typography, logo structure, posture)
  - `formulario_bolsa.pdf` — Original paper form being digitized (5 sections: applicant data, student data, sworn income/expense declaration, volunteer commitments, terms)

## Design System

All HTML files share the same CSS custom properties defined in `:root`. The canonical source of truth is `docs/brand-spec.md`.

Key tokens: `--accent` (navy), `--gold` (gold), `--bg` (warm paper), `--surface` (white cards). OKLch color space throughout.

Typography: serif display (`Iowan Old Style` stack) for headings, system sans for body. No external font loading.

Design posture: institutional gravity with warmth — no shadows on cards (borders + whitespace), 8px radius, gold used sparingly, generous whitespace with a print-magazine feel.

## Working With the Prototypes

Preview: open any HTML file directly in a browser (`open design/formulario.html`).

All styles are inline `<style>` blocks — no external CSS, no bundler. When modifying styles, keep token values consistent with `docs/brand-spec.md`.

## Domain Context

- **ACIPEC**: Associação Civil Para a Educação Católica (CNPJ 62.611.908/0001-99)
- The scholarship form collects: parent info, student/grade/tuition data, sworn family income declaration, monthly expenses, vehicle ownership, volunteer availability, and legal terms
- Language: all UI is Brazilian Portuguese (pt-BR)
