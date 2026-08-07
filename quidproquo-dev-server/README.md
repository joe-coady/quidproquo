# quidproquo-dev-server

Runs a whole [quidproquo](https://github.com/qpqjs/quidproquo) app on your machine.

It reads the same service configs the deploy packages read, stands up every route, websocket, queue, scheduled event and data store the app declares, and executes your stories through the real qpq runtime. Nothing is stubbed out or simplified.

```bash
npm install quidproquo-dev-server
```

You normally reach it through the `qpq` CLI or, in a scaffolded app, `npm run dev`.

## Why it works the way it does

The point of the dev server is that local behaviour matches deployed behaviour. It uses the same core code paths, the same serialization round-trips, and synthetic execution deadlines so a story that would time out in the cloud times out here too. When something needs a shortcut to work locally, that is treated as a bug in the dev server rather than an accepted difference.

## Where local data lives

Key value store data is one JSON file per store, under `<runtimePath>/kvs/<serviceName>/<storeName>.json`, where `runtimePath` defaults to `.qpq-runtime`. Each file is a pretty-printed `{ "items": [...] }` you can open, diff, or hand-edit.

Data is held in memory while the server runs and flushed to disk on a short debounce, so edits made while the server is running will be overwritten by the next flush. Stop the server before editing a store file by hand.

## Status

Pre-1.0. The whole `quidproquo-*` family releases in lockstep, so versions that share a number were built and tested together. Expect APIs to move between releases, and pin your versions.

## Documentation

[docs.quidproquojs.com](https://docs.quidproquojs.com)

## License

MIT. See [LICENSE](https://github.com/qpqjs/quidproquo/blob/main/LICENSE).
