# quidproquo-dev-server

Not prod ready

## Key value store data

KVS data lives as one JSON file per store, under `<runtimePath>/kvs/<serviceName>/<storeName>.json` (`runtimePath` defaults to `.qpq-runtime`). Each file is a pretty-printed `{ "items": [...] }` you can open, diff, or hand-edit directly.

Data is held in memory while the server runs and flushed to disk on a short debounce, so hand-edits made while the server is running will be overwritten by the next flush. Stop the server before editing a store file by hand.
