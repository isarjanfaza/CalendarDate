# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-10

### Added
- Initial release of dualcal
- Dual calendar display (Jalali + Gregorian in every cell)
- Beautiful desk-calendar design inspired by time.ir
- Dark mode support via CSS variables
- Full keyboard navigation
- Customizable themes with CSS variables
- Holiday support with validation and recurring events
- Event dots for custom events
- RTL layout by default
- Responsive design
- Framework-agnostic vanilla TypeScript implementation
- Comprehensive test coverage with Vitest
- ESM + CJS + DTS builds via tsup
- XSS-safe rendering (no innerHTML with user strings)
- ARIA attributes for accessibility
- Hijri date display (optional, via Intl API)
- Persian digit conversion utilities
- Month/year selector buttons
- Go to today button
- Holidays list display below calendar
- Tooltip support for holidays
- Persian and English documentation

### Technical Details
- Date engine: jalaali-js (peer dependency)
- Zero runtime dependencies
- TypeScript strict mode enabled
- ESLint + Prettier configured
- GitHub Actions CI for Node 18/20/22
- MIT licensed
