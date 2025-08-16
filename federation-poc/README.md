# Module Federation POC

Simple demonstration of Module Federation between two Node.js applications.

## Architecture

- **App1** (port 3001): Exposes an `add` function, consumes `multiply` from App2
- **App2** (port 3002): Exposes a `multiply` function, consumes `add` from App1

## Setup & Run

```bash
# Install dependencies for both apps
npm install
npm run install:all

# Build both apps
npm run build:all

# Start both servers (in separate terminals)
npm run start:app1
npm run start:app2

# Or run everything at once
npm run demo
```

## What happens

1. Both apps start HTTP servers that serve their federated modules
2. Each app exposes its remoteEntry.js file over HTTP
3. After 2 seconds, each app tries to import and use the other's function
4. You'll see console logs showing the cross-app function calls working

## Files

- `app1/src/add.js` - Add function exposed by App1
- `app2/src/multiply.js` - Multiply function exposed by App2
- Both webpack configs set up the federation with runtime plugins for Node.js