# HashMash — Laravel 10 + Vue 3 + TailwindCSS

## Overview
HashMash is a hash generation tool. Users enter text and instantly see cryptographic hashes (MD5, SHA1, SHA256, SHA512, CRC32, RIPEMD-160, etc.).

## Architecture
- **Backend**: Laravel 10 (PHP 8.2) with nwidart/laravel-modules for modular architecture
- **Modules**: `Modules/HashMash/` — contains the hash controller, routes, service provider, and config
- **Frontend**: Vue 3 + TailwindCSS served by Vite dev server on port 3000
- **Dev wiring**: Vite proxies `/api` requests to Laravel on port 8000; browser only talks to port 3000

## Docker Setup
- `docker-compose.base44.yml` — dev compose (single `web` service)
- `Dockerfile.base44` — PHP 8.2 + Node 20 + Composer base image
- `docker/start.sh` — scaffolds Laravel on first boot, installs deps, starts both servers

## First Boot
The first boot runs `composer create-project laravel/laravel:^10.0` into a temp dir, then copies files with `cp -rn` so pre-existing custom files (vite.config.js, tailwind.config.js, postcss.config.js, index.html, routes/api.php, HashController.php, Vue components) are preserved. Subsequent boots skip scaffolding and just install deps + start servers.

## Key Custom Files (not overwritten by scaffold)
- `vite.config.js` — Vue plugin + port 3000 + API proxy
- `index.html` — Vite entry point (SPA, not Blade)
- `Modules/HashMash/` — nwidart/laravel-modules module containing:
  - `app/Http/Controllers/HashController.php` — hash generation controller
  - `app/Providers/HashMashServiceProvider.php` — module service provider (loads routes)
  - `routes/api.php` — API routes for `/algorithms` and `/hash`
  - `config/config.php` — module configuration (available algorithms)
  - `module.json` — module metadata for nwidart/laravel-modules
  - `composer.json` — module-level composer config
- `resources/js/` — Vue 3 app (App.vue, components/HashTool.vue)
- `resources/css/app.css` — Tailwind entry
- `composer.json` — modified to add `nwidart/laravel-modules` and `Modules\` PSR-4 autoload

## Verification
- Visit `/` — HashMash UI loads
- Type text — hashes auto-generate (debounced 300ms)
- `GET /api/algorithms` — returns available algorithms
- `POST /api/hash` with `{ "text": "hello" }` — returns all hashes
