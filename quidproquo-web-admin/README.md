# quidproquo-web-admin — WIP, not for production

A React admin UI for Quidproquo backends — log viewing, config inspection, and
auth, wired to your deployed QPQ services.

This package is a **React component library**, not a standalone app. It ships
dual CommonJS/ESM builds (plus type declarations) compiled with `tsc`. There is
no bundler — you import `<App />` into your own host application and build/serve
it however you like. React (`>=18.3.1`) is a peer dependency, so the host owns
the React instance.

## Install

```bash
npm install quidproquo-web-admin
```

## Usage

Mount `<App />`, telling it how to resolve the URLs of your deployed QPQ
services:

```tsx
import { App } from 'quidproquo-web-admin';
import { BaseUrlResolvers } from 'quidproquo-web-react';
import { createRoot } from 'react-dom/client';

const urlResolvers: BaseUrlResolvers = {
  getApiUrl: () => 'https://api.example.com',
  getWsUrl: () => 'wss://ws.example.com',
};

createRoot(document.getElementById('root')!).render(<App urlResolvers={urlResolvers} />);
```

## Addons

The admin UI can be extended with addon tabs. `quidproquo-web-admin` does not
own the loading mechanism — the host application supplies a `loadAddons`
function (module federation, dynamic `import()`, a static array, whatever you
like), and the admin renders whatever addons it returns.

```tsx
import { App, createAddon, LoadFederatedAddons } from 'quidproquo-web-admin';

const MyTab = () => <div>Hello from an addon</div>;

const loadAddons: LoadFederatedAddons = async ({ baseUrlResolvers, accessToken }) => [
  createAddon('My Tab', MyTab),
];

<App urlResolvers={urlResolvers} loadAddons={loadAddons} />;
```

When `loadAddons` is omitted, no addons are loaded.

## Build

```bash
# from the repo root
npm run build -w quidproquo-web-admin
```

This runs `tsc` twice, emitting:

- `lib/esm` — ES modules (`module`, `types`)
- `lib/commonjs` — CommonJS (`main`)

```bash
# watch ESM during development
npm run watch -w quidproquo-web-admin
```

## License

MIT
