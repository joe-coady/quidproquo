---
sidebar_position: 13
---

# Math Actions

Generate random numbers and perform mathematical operations.

## Overview

Math actions provide platform-agnostic mathematical operations, particularly focused on secure random number generation that works consistently across different runtime environments.

## Available Actions

### askRandomNumber

Generate a cryptographically secure random number between 0 and 1.

#### Signature

```typescript
function* askRandomNumber(): MathRandomNumberActionRequester
```

#### Returns

Returns a number between 0 (inclusive) and 1 (exclusive).

#### Example

```typescript
import { askRandomNumber } from 'quidproquo-core';

// Generate random number
function* generateRandomValue() {
  const random = yield* askRandomNumber();
  return random; // 0.7234567890123456
}

// Generate random integer in range
function* randomInteger(min: number, max: number) {
  const random = yield* askRandomNumber();
  return Math.floor(random * (max - min + 1)) + min;
}

// Generate random boolean
function* randomBoolean(probability: number = 0.5) {
  const random = yield* askRandomNumber();
  return random < probability;
}
```

## Usage Patterns

### Random Selection

```typescript
function* selectRandomItem<T>(items: T[]): Generator<any, T, any> {
  if (items.length === 0) {
    yield* askThrowError(ErrorTypeEnum.BadRequest, 'Empty array');
  }
  
  const random = yield* askRandomNumber();
  const index = Math.floor(random * items.length);
  
  return items[index];
}

function* shuffleArray<T>(array: T[]): Generator<any, T[], any> {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const random = yield* askRandomNumber();
    const j = Math.floor(random * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}
```

### Random ID Generation

```typescript
function* generateRandomCode(length: number = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const random = yield* askRandomNumber();
    const index = Math.floor(random * chars.length);
    code += chars[index];
  }
  
  return code;
}

function* generatePin(digits: number = 4) {
  let pin = '';
  
  for (let i = 0; i < digits; i++) {
    const random = yield* askRandomNumber();
    pin += Math.floor(random * 10);
  }
  
  return pin;
}
```

### Probability and Sampling

```typescript
function* weightedRandom<T>(items: Array<{ value: T; weight: number }>) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const random = yield* askRandomNumber();
  let threshold = random * totalWeight;
  
  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item.value;
    }
  }
  
  return items[items.length - 1].value;
}

function* sampleWithReplacement<T>(population: T[], sampleSize: number) {
  const sample: T[] = [];
  
  for (let i = 0; i < sampleSize; i++) {
    const random = yield* askRandomNumber();
    const index = Math.floor(random * population.length);
    sample.push(population[index]);
  }
  
  return sample;
}
```

### Random Delays

```typescript
function* randomDelay(minMs: number, maxMs: number) {
  const random = yield* askRandomNumber();
  const delay = minMs + random * (maxMs - minMs);
  
  yield* askDelay(Math.floor(delay));
}

function* exponentialBackoff(attempt: number, baseMs: number = 1000) {
  const random = yield* askRandomNumber();
  const jitter = random * 0.3; // 30% jitter
  const delay = baseMs * Math.pow(2, attempt) * (1 + jitter);
  
  yield* askDelay(Math.floor(delay));
}
```

### A/B Testing

```typescript
function* selectVariant(variants: Array<{ name: string; allocation: number }>) {
  const random = yield* askRandomNumber();
  let cumulative = 0;
  
  for (const variant of variants) {
    cumulative += variant.allocation;
    if (random < cumulative) {
      return variant.name;
    }
  }
  
  return variants[variants.length - 1].name;
}

function* runExperiment(userId: string) {
  const variant = yield* selectVariant([
    { name: 'control', allocation: 0.5 },
    { name: 'variant_a', allocation: 0.25 },
    { name: 'variant_b', allocation: 0.25 }
  ]);
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Experiment assignment', {
    userId,
    variant,
    timestamp: yield* askDateNow()
  });
  
  return variant;
}
```

### Random Token Generation

```typescript
function* generateSecureToken(bytes: number = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let token = '';
  
  for (let i = 0; i < bytes; i++) {
    const random = yield* askRandomNumber();
    token += chars[Math.floor(random * chars.length)];
  }
  
  return token;
}

function* generateApiKey() {
  const prefix = 'sk_live_';
  const token = yield* generateSecureToken(32);
  
  return `${prefix}${token}`;
}
```

## Testing

```typescript
describe('Math Actions', () => {
  test('generates random number', () => {
    function* getRandomValue() {
      return yield* askRandomNumber();
    }
    
    const story = getRandomValue();
    const { value: action } = story.next();
    
    expect(action.type).toBe('Math::RandomNumber');
    
    const mockRandom = 0.567890123;
    const { value: result } = story.next(mockRandom);
    
    expect(result).toBe(mockRandom);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });
  
  test('random selection', () => {
    function* selectRandom(items: any[]) {
      const random = yield* askRandomNumber();
      return items[Math.floor(random * items.length)];
    }
    
    const story = selectRandom(['a', 'b', 'c']);
    story.next();
    
    const { value: result } = story.next(0.5); // Will select 'b'
    expect(result).toBe('b');
  });
});
```

## Best Practices

### 1. Use for Cryptographic Randomness

```typescript
// Good - secure random for tokens
const token = yield* generateSecureToken();

// Bad - using Math.random()
const insecureToken = Math.random().toString(36);
```

### 2. Seed-Independent

```typescript
// Good - platform handles randomness
const random = yield* askRandomNumber();

// Bad - trying to seed random
const seededRandom = new SeededRandom(12345);
```

### 3. Range Calculations

```typescript
// Good - proper range calculation
function* randomInRange(min: number, max: number) {
  const random = yield* askRandomNumber();
  return min + random * (max - min);
}

// Bad - biased distribution
function* biasedRandom(max: number) {
  const random = yield* askRandomNumber();
  return random * max; // Excludes max
}
```

## Related Actions

- **GUID Actions** - For unique identifiers
- **Platform Actions** - For random delays
- **Crypto Actions** - For cryptographic operations