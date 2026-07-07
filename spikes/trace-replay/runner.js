// The "framework" side — mimics qpqExecuteLog/resolveStory: drives the story
// generator, answering every yielded action from recorded history, with an async
// boundary between every action (like processAction). This file must NOT appear
// in the trace — only story.js should.
//
// Usage:
//   node runner.js step                 free stepInto + blackboxing
//   node runner.js breakpoints          breakpoint-per-statement + resume
//   node runner.js step --macrotask     harder async boundary (setImmediate)
//
// Prints: baseline vs traced timing, steps/sec, and story.js source annotated
// with the values each line produced — the target UX of the real feature.

const fs = require('node:fs');
const path = require('node:path');
const { Worker } = require('node:worker_threads');

const { askOnboardUsers } = require('./story');

const MODE = process.argv[2] || 'step';
const USE_MACROTASK = process.argv.includes('--macrotask');
const USER_COUNT = Number(process.env.SPIKE_USERS || 50);

// ── Recorded history (StoryResult.history[i].res equivalents) ────────────────
const makeHistory = (userCount) => {
  const history = ['guid-abcd-efg-1234', { first: '  Owner  ', last: ' Person ' }];
  for (let i = 0; i < userCount; i += 1) {
    history.push({ first: `First${i}`, last: `Last${i}` });
  }
  return history;
};

// The stand-in action processor: async => a microtask boundary between every
// yield, exactly like processAction awaiting a processor. --macrotask upgrades
// it to a full task boundary to stress the stepping chain harder.
const makeProcessor = (history) => {
  let index = 0;
  return async () => {
    const result = history[index];
    index += 1;
    if (USE_MACROTASK) {
      await new Promise((resolve) => setImmediate(resolve));
    }
    return result;
  };
};

// resolveStory, minimally.
const replay = async (story, args, processor) => {
  const reader = story(...args);
  let progress = reader.next();
  let actions = 0;
  while (!progress.done) {
    const result = await processor(progress.value);
    actions += 1;
    progress = reader.next(result);
  }
  return { result: progress.value, actions };
};

// The tracer's start signal — mirrors the `debugger;` statement in qpqExecuteLog.
// In step mode the controller arms blackboxing on this pause.
const traceStart = () => {
  // eslint-disable-next-line no-debugger
  debugger;
};

// ── Annotated-source rendering (the payoff demo) ─────────────────────────────
// Values produced by executing line L show up in the locals of the NEXT step, so
// attribute the diff of step[i] -> step[i+1] (same function only) to step[i].line.
const buildLineEffects = (steps) => {
  const effects = new Map(); // 0-based line -> { count, changes }
  for (let i = 0; i < steps.length; i += 1) {
    const current = steps[i];
    const next = steps[i + 1];
    const effect = effects.get(current.line) || { count: 0, changes: {} };
    effect.count += 1;
    if (next && next.fn === current.fn) {
      for (const [name, value] of Object.entries(next.locals)) {
        if (current.locals[name] !== value) {
          effect.changes[name] = value;
        }
      }
    }
    effects.set(current.line, effect);
  }
  return effects;
};

const renderAnnotatedSource = (steps) => {
  const effects = buildLineEffects(steps);
  const sourceLines = fs.readFileSync(path.join(__dirname, 'story.js'), 'utf8').split('\n');

  console.log('\n── story.js, annotated from the trace ' + '─'.repeat(42));
  sourceLines.forEach((text, lineIndex) => {
    const effect = effects.get(lineIndex);
    let annotation = '';
    if (effect) {
      const visits = effect.count > 1 ? `×${effect.count} ` : '';
      const changes = Object.entries(effect.changes)
        .slice(0, 3)
        .map(([name, value]) => `${name} = ${value}`)
        .join(', ');
      annotation = `   // ${visits}${changes}`.trimEnd();
    }
    console.log(String(lineIndex + 1).padStart(3) + ' | ' + text + annotation);
  });
};

// ── Main ─────────────────────────────────────────────────────────────────────
const main = async () => {
  // Baseline BEFORE the controller attaches (in breakpoints mode the breakpoints
  // exist from 'ready' onward, so this run must come first).
  const baselineStart = Date.now();
  const baseline = await replay(askOnboardUsers, [USER_COUNT], makeProcessor(makeHistory(USER_COUNT)));
  const baselineMs = Date.now() - baselineStart;

  const controller = new Worker(path.join(__dirname, 'controller.js'), { workerData: { mode: MODE } });
  const fromController = (type) =>
    new Promise((resolve, reject) => {
      const onMessage = (message) => {
        if (message.type === 'fatal') {
          controller.off('message', onMessage);
          reject(new Error(`controller: ${message.error}`));
        } else if (message.type === type) {
          controller.off('message', onMessage);
          resolve(message);
        }
      };
      controller.on('message', onMessage);
      controller.on('error', reject);
    });

  await fromController('ready');

  traceStart();
  const tracedStart = Date.now();
  const traced = await replay(askOnboardUsers, [USER_COUNT], makeProcessor(makeHistory(USER_COUNT)));
  const tracedMs = Date.now() - tracedStart;

  const tracePromise = fromController('trace');
  controller.postMessage({ type: 'done' });
  const trace = await tracePromise;

  const tracePath = path.join(__dirname, `trace-${MODE}${USE_MACROTASK ? '-macrotask' : ''}.json`);
  fs.writeFileSync(tracePath, JSON.stringify(trace, null, 2));

  renderAnnotatedSource(trace.steps);

  const { stats } = trace;
  const stepsPerSecond = stats.traceWindowMs > 0 ? Math.round((stats.pauses / stats.traceWindowMs) * 1000) : Infinity;
  console.log(`\n── results (${MODE}${USE_MACROTASK ? ' + macrotask boundary' : ''}) ${'─'.repeat(40)}`);
  console.log(`actions replayed:      ${traced.actions} (baseline ${baseline.actions})`);
  console.log(`result matches:        ${JSON.stringify(traced.result) === JSON.stringify(baseline.result)}`);
  console.log(`story steps captured:  ${stats.storySteps}`);
  console.log(`total pauses:          ${stats.pauses}${stats.breakpointCount ? ` (breakpoints set: ${stats.breakpointCount})` : ''}`);
  console.log(`baseline replay:       ${baselineMs}ms`);
  console.log(`traced replay:         ${tracedMs}ms (${stats.localsCaptureMs}ms in locals capture)`);
  console.log(`pause throughput:      ~${stepsPerSecond} pauses/sec`);
  const stray = Object.entries(stats.strayPauses || {});
  if (stray.length) console.log(`stray pauses:          ${stray.map(([url, n]) => `${url}×${n}`).join(', ')}`);
  if (stats.bailed) console.log('⚠ controller hit MAX_COMMANDS and bailed');
  if (stats.storySteps === 0) console.log('⚠ NO story steps captured — stepping chain lost');
  console.log(`trace written:         ${tracePath}`);

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
