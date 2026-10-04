#!/bin/bash
set -e

# Disable Composer security advisory blocking (Laravel 10 has known advisories)
composer config --global policy.advisories.block false

# Scaffold Laravel 10 if not already present
if [ ! -f artisan ]; then
    echo ">>> Scaffolding Laravel 10 project..."
    rm -rf /tmp/laravel
    COMPOSER_NO_AUDIT=1 composer create-project laravel/laravel:^10.0 /tmp/laravel --prefer-dist --no-interaction
    # Copy files without overwriting existing ones (preserves our custom files)
    cp -rn /tmp/laravel/* .
    cp -rn /tmp/laravel/.[!.]* . 2>/dev/null || true
    rm -rf /tmp/laravel

    # Configure .env for SQLite (no external DB needed)
    sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
    sed -i 's/^DB_HOST=.*/DB_HOST=/' .env
    sed -i 's/^DB_PORT=.*/DB_PORT=/' .env
    sed -i 's/^DB_DATABASE=.*/DB_DATABASE=\/app\/database\/database.sqlite/' .env
    sed -i 's/^DB_USERNAME=.*/DB_USERNAME=/' .env
    sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=/' .env

    mkdir -p database
    touch database/database.sqlite

    # Generate application key
    php artisan key:generate
fi

# Install composer dependencies
echo ">>> Installing composer dependencies..."
COMPOSER_NO_AUDIT=1 composer install --no-interaction --optimize-autoloader

# Ensure Vue 3 and TailwindCSS v3 are in package.json (v4 changed PostCSS integration)
if ! grep -q '"@vitejs/plugin-vue"' package.json || ! grep -q '"tailwindcss": "3' package.json; then
    echo ">>> Adding/pinning Vue 3 and TailwindCSS v3..."
    npm install --save-dev vue @vitejs/plugin-vue tailwindcss@3 postcss autoprefixer
fi

# Install npm dependencies
echo ">>> Installing npm dependencies..."
npm install

# Start Laravel API server on port 8000 (internal)
echo ">>> Starting Laravel API server..."
php artisan serve --host=0.0.0.0 --port=8000 &

# Start Vite dev server on port 3000 (mapped to host)
echo ">>> Starting Vite dev server..."
exec npx vite --host 0.0.0.0 --port 3000
