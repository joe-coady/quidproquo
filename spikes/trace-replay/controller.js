// The debug controller — runs on a WORKER THREAD and debugs the MAIN thread via
// the in-process V8 inspector (no port, no attach). This is the mechanism the
// real tracer would use inside a lambda.
//
// Two strategies (workerData.mode):
//   'step'        — blackbox every script except story.js, then Debugger.stepInto
//                   repeatedly. Tests whether stepping survives the async boundary
//                   in the replay loop (yield -> await processor() -> reader.next()).
//   'breakpoints' — Debugger.getPossibleBreakpoints over story.js, set a breakpoint
//                   on every statement, and plain resume between hits. Immune to
//                   async-boundary step loss; the fallback strategy in the plan.
//
// On every pause in story.js it records {line, column, fn, locals} — locals come
// from Runtime.getProperties on the frame's local/block scopes.

const inspector = require('node:inspector');
const { parentPort, workerData } = require('node:worker_threads');

const MODE = workerData.mode; // 'step' | 'breakpoints'
const MAX_COMMANDS = 500_000;

const session = new inspector.Session();
session.connectToMainThread();

const post = (method, params = {}) =>
  new Promise((resolve, reject) =>
    session.post(method, params, (err, result) => (err ? reject(new Error(`${method}: ${err.message}`)) : resolve(result))),
  );

const isStoryUrl = (url) => typeof url === 'string' && url.replace(/\\/g, '/').endsWith('/story.js');

const scriptsById = new Map(); // scriptId -> url
session.on('Debugger.scriptParsed', (message) => {
  scriptsById.set(message.params.scriptId, message.params.url);
});

// Node 20 reports callFrames[0].url as '' — the script URL must be resolved via
// location.scriptId against the scriptParsed map.
const frameUrl = (frame) => frame.url || scriptsById.get(frame.location.scriptId) || '';

// ── Value summarization ───────────────────────────────────────────────────────
// Turn a CDP RemoteObject into a short display string (the real tracer would keep
// a structured, size-capped value instead).
const summarizeValue = (remoteObject) => {
  if (!remoteObject) return undefined;
  if (remoteObject.type === 'undefined') return 'undefined';
  if (remoteObject.subtype === 'null') return 'null';
  if (['string', 'number', 'boolean', 'bigint'].includes(remoteObject.type)) {
    return JSON.stringify(remoteObject.unserializableValue ?? remoteObject.value);
  }
  if (remoteObject.preview) {
    const props = remoteObject.preview.properties
      .slice(0, 4)
      .map((p) => (remoteObject.subtype === 'array' ? p.value : `${p.name}: ${p.type === 'string' ? `'${p.value}'` : p.value}`))
      .join(', ');
    const overflow = remoteObject.preview.overflow || remoteObject.preview.properties.length > 4 ? ', …' : '';
    return remoteObject.subtype === 'array' ? `[${props}${overflow}]` : `{${props}${overflow}}`;
  }
  return remoteObject.description || remoteObject.type;
};

// ── Step capture ──────────────────────────────────────────────────────────────
const steps = [];
let localsCaptureMs = 0;

const captureStep = async (frame) => {
  const locals = {};
  const before = Date.now();

  // Outermost -> innermost so inner (block) scopes win on name collisions.
  const scopes = frame.scopeChain.filter((s) => (s.type === 'local' || s.type === 'block') && s.object?.objectId).reverse();
  for (const scope of scopes) {
    const { result } = await post('Runtime.getProperties', {
      objectId: scope.object.objectId,
      ownProperties: true,
      generatePreview: true,
    });
    for (const property of result) {
      locals[property.name] = summarizeValue(property.value);
    }
  }

  localsCaptureMs += Date.now() - before;

  steps.push({
    line: frame.location.lineNumber,
    column: frame.location.columnNumber,
    fn: frame.functionName || '(anonymous)',
    locals,
  });
};

// ── Pause loop ────────────────────────────────────────────────────────────────
let pauses = 0;
let commands = 0;
let firstPauseAt = 0;
let lastPauseAt = 0;
let blackboxArmed = false;
let bailed = false;
const strayPauses = new Map(); // non-story url -> count (diagnostic)

const onPaused = async (message) => {
  pauses += 1;
  lastPauseAt = Date.now();
  if (!firstPauseAt) firstPauseAt = lastPauseAt;

  const topFrame = message.params.callFrames[0];
  const topUrl = frameUrl(topFrame);
  if (isStoryUrl(topUrl)) {
    await captureStep(topFrame);
  } else {
    const shortUrl = topUrl.split('/').pop() || '(no url)';
    strayPauses.set(shortUrl, (strayPauses.get(shortUrl) || 0) + 1);
  }

  if (MODE === 'step') {
    // Arm blackboxing on the FIRST pause (the `debugger;` statement in the runner) —
    // mirrors the real tracer arming on qpqExecuteLog's debugger statement. A debugger
    // statement inside an already-blackboxed script would never fire, so arm-after-pause
    // is the required ordering.
    if (!blackboxArmed) {
      await post('Debugger.setBlackboxPatterns', { patterns: ['^(?!.*story\\.js).*$'] });
      blackboxArmed = true;
    }

    commands += 1;
    if (commands > MAX_COMMANDS) {
      bailed = true;
      await post('Debugger.resume');
      return;
    }
    await post('Debugger.stepInto');
  } else {
    await post('Debugger.resume');
  }
};

session.on('Debugger.paused', (message) => {
  onPaused(message).catch((error) => {
    parentPort.postMessage({ type: 'fatal', error: String(error?.stack || error) });
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
const waitForStoryScript = async () => {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    for (const [scriptId, url] of scriptsById) {
      if (isStoryUrl(url)) return scriptId;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('story.js never appeared in scriptParsed events');
};

let breakpointCount = 0;

const init = async () => {
  await post('Runtime.enable');
  await post('Debugger.enable');
  await post('Debugger.setAsyncCallStackDepth', { maxDepth: 32 });

  if (MODE === 'breakpoints') {
    const scriptId = await waitForStoryScript();
    const { locations } = await post('Debugger.getPossibleBreakpoints', {
      start: { scriptId, lineNumber: 0, columnNumber: 0 },
    });
    for (const location of locations) {
      await post('Debugger.setBreakpoint', { location });
    }
    breakpointCount = locations.length;
  }

  parentPort.postMessage({ type: 'ready' });
};

parentPort.on('message', (message) => {
  if (message.type === 'done') {
    parentPort.postMessage({
      type: 'trace',
      mode: MODE,
      steps,
      stats: {
        pauses,
        storySteps: steps.length,
        breakpointCount,
        traceWindowMs: lastPauseAt - firstPauseAt,
        localsCaptureMs,
        bailed,
        strayPauses: Object.fromEntries(strayPauses),
      },
    });
  }
});

init().catch((error) => {
  parentPort.postMessage({ type: 'fatal', error: String(error?.stack || error) });
});
