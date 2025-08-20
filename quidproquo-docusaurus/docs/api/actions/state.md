---
sidebar_position: 17
---

# State Actions

Manage local mutable state within story executions using Redux-style patterns.

## Overview

State actions provide local, mutable state management within story executions. Using a Redux-style approach with actions and reducers, state can be read and modified throughout a story's lifecycle while maintaining predictability and debuggability.

## Available Actions

### askStateRead

Read the current state value.

#### Signature

```typescript
function* askStateRead<State>(): StateReadActionRequester<State>
```

#### Returns

Returns the current state value.

#### Example

```typescript
import { askStateRead } from 'quidproquo-core';

function* getCurrentCount() {
  const state = yield* askStateRead<{ count: number }>();
  return state.count;
}
```

### askStateDispatch

Dispatch an action to modify state.

#### Signature

```typescript
function* askStateDispatch<Action>(
  action: Action
): StateDispatchActionRequester<Action>
```

#### Parameters

- **action** (`Action`): Redux-style action with type and optional payload

#### Example

```typescript
import { askStateDispatch } from 'quidproquo-core';

// Define actions
type CounterAction = 
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET'; payload: number };

function* incrementCounter() {
  yield* askStateDispatch<CounterAction>({ type: 'INCREMENT' });
}

function* setCounter(value: number) {
  yield* askStateDispatch<CounterAction>({ 
    type: 'SET', 
    payload: value 
  });
}
```

## State Management Patterns

### Counter Example

```typescript
// State shape
interface CounterState {
  count: number;
  lastUpdated: string;
}

// Actions
type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET'; value: number };

// Reducer
function counterReducer(
  state: CounterState = { count: 0, lastUpdated: '' },
  action: CounterAction
): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1,
        lastUpdated: new Date().toISOString()
      };
    case 'DECREMENT':
      return {
        count: state.count - 1,
        lastUpdated: new Date().toISOString()
      };
    case 'RESET':
      return {
        count: 0,
        lastUpdated: new Date().toISOString()
      };
    case 'SET':
      return {
        count: action.value,
        lastUpdated: new Date().toISOString()
      };
    default:
      return state;
  }
}

// Usage in stories
function* counterOperations() {
  // Read initial state
  const initial = yield* askStateRead<CounterState>();
  yield* askLogCreate(LogLevelEnum.INFO, 'Initial count', { count: initial.count });
  
  // Increment
  yield* askStateDispatch<CounterAction>({ type: 'INCREMENT' });
  
  // Read updated state
  const afterIncrement = yield* askStateRead<CounterState>();
  yield* askLogCreate(LogLevelEnum.INFO, 'After increment', { count: afterIncrement.count });
  
  // Set specific value
  yield* askStateDispatch<CounterAction>({ type: 'SET', value: 10 });
  
  // Reset
  yield* askStateDispatch<CounterAction>({ type: 'RESET' });
  
  const final = yield* askStateRead<CounterState>();
  return final;
}
```

### Form State Management

```typescript
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'TOUCH_FIELD'; field: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; errors: Record<string, string> }
  | { type: 'RESET' };

function* formHandler() {
  // Initialize form
  yield* askStateDispatch<FormAction>({ type: 'RESET' });
  
  // Update field
  yield* askStateDispatch<FormAction>({
    type: 'SET_FIELD',
    field: 'email',
    value: 'user@example.com'
  });
  
  // Mark field as touched
  yield* askStateDispatch<FormAction>({
    type: 'TOUCH_FIELD',
    field: 'email'
  });
  
  // Validate
  const state = yield* askStateRead<FormState>();
  if (!state.values.email?.includes('@')) {
    yield* askStateDispatch<FormAction>({
      type: 'SET_ERROR',
      field: 'email',
      error: 'Invalid email'
    });
  }
  
  // Submit
  yield* askStateDispatch<FormAction>({ type: 'SUBMIT_START' });
  
  try {
    yield* submitForm(state.values);
    yield* askStateDispatch<FormAction>({ type: 'SUBMIT_SUCCESS' });
  } catch (error) {
    yield* askStateDispatch<FormAction>({
      type: 'SUBMIT_ERROR',
      errors: error.validationErrors
    });
  }
}
```

### Loading State

```typescript
interface LoadingState {
  isLoading: boolean;
  data: any;
  error: string | null;
}

type LoadingAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: any }
  | { type: 'FETCH_ERROR'; error: string };

function* fetchWithLoadingState(url: string) {
  // Start loading
  yield* askStateDispatch<LoadingAction>({ type: 'FETCH_START' });
  
  try {
    const data = yield* askNetworkRequest('GET', url);
    
    // Success
    yield* askStateDispatch<LoadingAction>({
      type: 'FETCH_SUCCESS',
      data
    });
    
    return data;
  } catch (error) {
    // Error
    yield* askStateDispatch<LoadingAction>({
      type: 'FETCH_ERROR',
      error: error.message
    });
    
    throw error;
  }
}
```

### Pagination State

```typescript
interface PaginationState {
  items: any[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  isLoading: boolean;
}

type PaginationAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_PAGE_SIZE'; size: number }
  | { type: 'LOAD_PAGE'; items: any[]; total: number }
  | { type: 'LOADING'; isLoading: boolean };

function* paginatedList(fetchFn: Function) {
  const state = yield* askStateRead<PaginationState>();
  
  // Set loading
  yield* askStateDispatch<PaginationAction>({
    type: 'LOADING',
    isLoading: true
  });
  
  // Fetch page
  const result = yield* fetchFn(state.currentPage, state.pageSize);
  
  // Update state
  yield* askStateDispatch<PaginationAction>({
    type: 'LOAD_PAGE',
    items: result.items,
    total: result.total
  });
  
  yield* askStateDispatch<PaginationAction>({
    type: 'LOADING',
    isLoading: false
  });
  
  return result.items;
}

function* goToPage(page: number) {
  yield* askStateDispatch<PaginationAction>({
    type: 'SET_PAGE',
    page
  });
  
  return yield* paginatedList(fetchItems);
}
```

### Multi-Step Wizard

```typescript
interface WizardState {
  currentStep: number;
  totalSteps: number;
  stepData: Record<number, any>;
  completed: boolean;
}

type WizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'SAVE_STEP_DATA'; step: number; data: any }
  | { type: 'COMPLETE' };

function* wizardFlow() {
  // Initialize wizard
  const initialState: WizardState = {
    currentStep: 0,
    totalSteps: 3,
    stepData: {},
    completed: false
  };
  
  // Step 1: Basic Info
  const basicInfo = yield* collectBasicInfo();
  yield* askStateDispatch<WizardAction>({
    type: 'SAVE_STEP_DATA',
    step: 0,
    data: basicInfo
  });
  yield* askStateDispatch<WizardAction>({ type: 'NEXT_STEP' });
  
  // Step 2: Details
  const details = yield* collectDetails();
  yield* askStateDispatch<WizardAction>({
    type: 'SAVE_STEP_DATA',
    step: 1,
    data: details
  });
  yield* askStateDispatch<WizardAction>({ type: 'NEXT_STEP' });
  
  // Step 3: Review
  const state = yield* askStateRead<WizardState>();
  const allData = state.stepData;
  
  const confirmed = yield* confirmData(allData);
  if (confirmed) {
    yield* askStateDispatch<WizardAction>({ type: 'COMPLETE' });
    return yield* submitWizardData(allData);
  } else {
    // Go back to edit
    yield* askStateDispatch<WizardAction>({
      type: 'GO_TO_STEP',
      step: 0
    });
  }
}
```

### Undo/Redo

```typescript
interface UndoableState<T> {
  past: T[];
  present: T;
  future: T[];
}

type UndoableAction<T> =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE'; value: T }
  | { type: 'RESET' };

function createUndoableReducer<T>(
  initialValue: T
): (state: UndoableState<T>, action: UndoableAction<T>) => UndoableState<T> {
  return (state = { past: [], present: initialValue, future: [] }, action) => {
    switch (action.type) {
      case 'UNDO':
        if (state.past.length === 0) return state;
        return {
          past: state.past.slice(0, -1),
          present: state.past[state.past.length - 1],
          future: [state.present, ...state.future]
        };
      
      case 'REDO':
        if (state.future.length === 0) return state;
        return {
          past: [...state.past, state.present],
          present: state.future[0],
          future: state.future.slice(1)
        };
      
      case 'UPDATE':
        return {
          past: [...state.past, state.present],
          present: action.value,
          future: []
        };
      
      case 'RESET':
        return {
          past: [],
          present: initialValue,
          future: []
        };
      
      default:
        return state;
    }
  };
}

function* undoableOperations() {
  // Make changes
  yield* askStateDispatch<UndoableAction<string>>({
    type: 'UPDATE',
    value: 'First change'
  });
  
  yield* askStateDispatch<UndoableAction<string>>({
    type: 'UPDATE',
    value: 'Second change'
  });
  
  // Undo
  yield* askStateDispatch<UndoableAction<string>>({ type: 'UNDO' });
  
  // Redo
  yield* askStateDispatch<UndoableAction<string>>({ type: 'REDO' });
  
  const state = yield* askStateRead<UndoableState<string>>();
  return state.present;
}
```

## Testing

```typescript
describe('State Actions', () => {
  test('reads and dispatches state', () => {
    function* stateOperations() {
      const initial = yield* askStateRead<{ count: number }>();
      
      yield* askStateDispatch({ type: 'INCREMENT' });
      
      const updated = yield* askStateRead<{ count: number }>();
      
      return { initial, updated };
    }
    
    const story = stateOperations();
    
    // Read initial state
    const { value: readAction1 } = story.next();
    expect(readAction1.type).toBe('State::Read');
    
    // Provide initial state
    story.next({ count: 0 });
    
    // Dispatch action
    const { value: dispatchAction } = story.next();
    expect(dispatchAction.type).toBe('State::Dispatch');
    expect(dispatchAction.payload.action.type).toBe('INCREMENT');
    
    // Continue execution
    story.next();
    
    // Read updated state
    const { value: readAction2 } = story.next();
    expect(readAction2.type).toBe('State::Read');
    
    // Provide updated state
    const { value: result } = story.next({ count: 1 });
    
    expect(result.initial.count).toBe(0);
    expect(result.updated.count).toBe(1);
  });
});
```

## Best Practices

### 1. Keep State Local

```typescript
// Good - state scoped to story
function* localStateStory() {
  const state = yield* askStateRead<LocalState>();
  // State is isolated to this story execution
}

// Bad - trying to share state globally
const globalState = {}; // Don't do this
```

### 2. Use Immutable Updates

```typescript
// Good - immutable update
yield* askStateDispatch({
  type: 'UPDATE',
  payload: { ...oldState, field: newValue }
});

// Bad - mutating state
state.field = newValue; // Don't mutate directly
```

### 3. Define Clear Action Types

```typescript
// Good - descriptive action types
type Action =
  | { type: 'USER_LOGIN_SUCCESS'; user: User }
  | { type: 'USER_LOGOUT' }
  | { type: 'USER_UPDATE_PROFILE'; updates: Partial<User> };

// Bad - generic actions
type Action = { type: string; data?: any };
```

## Related Actions

- **Context Actions** - For cross-cutting state
- **KeyValueStore Actions** - For persistent state
- **Event Actions** - For state events
- **Platform Actions** - For state timing