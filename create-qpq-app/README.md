# create-qpq-app

Scaffold a new [quidproquo](https://github.com/joe-coady/quidproquo) app:

```bash
npx create-qpq-app my-app
cd my-app
npm run dev
```

You get a full QPQ workspace with five services (`admin`, `auth`, `design`,
`shell` and `todo`) that builds, runs locally on the QPQ dev server, and
deploys as a single docker image with `npm run deploy`.

## Options

```
npx create-qpq-app <app-name> [options]

--language <typescript|javascript>   skip the language prompt
--domain <domain>                    app domain (default: <app-name>.example.com)
--no-git                             skip git init
--no-install                         skip npm install
```

## How it works

The template is a snapshot of quidproquojs.com — a real, continuously-built
QPQ workspace — captured into this package at publish time. Scaffolding runs
a pipeline of self-contained steps (prune the docs site, prune the website
app, apply your app's identity/domain, pin quidproquo versions, git init,
install). The generated app pins the `quidproquo-*` versions this package was
published with; the whole family releases in lockstep.
