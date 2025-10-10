# Portal IT Portable

Portal Tauri + React + SQLite diseñado para funcionar 100% offline desde una memoria USB. Este scaffolding reemplaza el portal HTML actual con una aplicación híbrida empaquetable con Tauri.

## Estructura del proyecto

```
portal-it/
├─ index.html
├─ package.json
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ components/
│  ├─ data/
│  ├─ hooks/
│  ├─ pages/
│  └─ styles.css
├─ src-tauri/
│  ├─ Cargo.toml
│  ├─ build.rs
│  ├─ tauri.conf.json
│  ├─ migrations/
│  │  └─ 001_init.sql
│  └─ src/
│     ├─ db.rs
│     ├─ main.rs
│     └─ models.rs
└─ README.md
```

## Dependencias clave

- **Frontend:** React + Vite (TypeScript), TailwindCSS, shadcn/ui ready.
- **Backend local:** Tauri 2 + SQLite (rusqlite) con helpers CRUD básicos.
- **Seguridad:** Dependencia `argon2` para hash de credenciales cuando se implementen usuarios.

## Scripts útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (frontend + tauri)
npm run tauri:dev

# Compilar assets web
npm run build

# Construir ejecutable portable
npm run tauri:build
```

## Flujo de persistencia

- El archivo de base de datos `portal.db` se crea en `%APPDATA%/com.portal.it.portable` (Windows) o equivalente en otros sistemas.
- Comandos expuestos mediante `invoke` permiten CRUD en tareas, switches y bookmarks.
- El botón **Exportar USB** llama a `export_database` que solicita una ruta y genera un JSON completo con todas las tablas.
- Para importar respaldos (compatibles con `site_switch_manager_v5`), llama a `import_database` desde un botón o menú.

## Empaquetado para USB

1. Instala Rust (stable) y los toolchains de Windows (MSVC).
2. Ejecuta `npm install` y luego `npm run tauri:build`.
3. El ejecutable se genera en `src-tauri/target/release/bundle/`. Copia la carpeta completa (incluyendo `.exe` y recursos) a la memoria USB.
4. Coloca tus carpetas `manuales/` y `formatos/` junto al ejecutable o dentro de `resources` según `tauri.conf.json` para que se incluyan en el paquete.
5. El sistema funciona offline; los enlaces HTTPS locales se abren con el navegador predeterminado.

## Ejecución 100% offline

- No hay llamadas externas en el frontend; los datos provienen de `invoke` o `mockSections` cuando no hay registros.
- Usa rutas relativas (`./manuales/...`) para manuales y formatos.
- Los respaldos JSON permiten migrar datos entre USBs sin conexión.

## Próximos pasos sugeridos

- Implementar cifrado de credenciales con `argon2` + clave maestra.
- Añadir UI para importar respaldos y gestionar usuarios.
- Integrar módulos de puertos/VLAN con autosave.

