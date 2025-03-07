# quidproquo-actionprocessor-web

The `quidproquo-actionprocessor-web` library provides a set of generic action processors for the `quidproquo` framework, allowing you to easily
integrate common functionality into your Node.js-based applications.

## Key Features

1. **Comprehensive Action Processors**: This library includes a wide range of action processors that cover various common use cases, such as date/time
   operations, error handling, event processing, GUID generation, logging, math operations, network requests, platform-specific functionality (e.g.,
   delays), and system-level actions.

2. **Extensibility**: The action processor architecture is designed to be highly extensible, allowing you to easily add custom action processors to
   meet your specific requirements.

3. **Dependency Injection**: The action processors are integrated with the `quidproquo` dependency injection system, making it easy to compose and
   test your application components.

4. **Testability**: The action-oriented architecture and asynchronous execution model of `quidproquo-actionprocessor-web` make it highly testable,
   with support for unit, integration, and end-to-end testing.

5. **Portability**: While the `quidproquo-actionprocessor-web` library is designed to run on Node.js, the underlying `quidproquo-core` library is
   platform-agnostic, allowing you to potentially use these action processors in other environments as well.

## Getting Started

To use the `quidproquo-actionprocessor-web` library, you'll need to install the package and its dependencies. You can do this using your preferred
package manager, such as npm or yarn:

```
npm install quidproquo-actionprocessor-web
```

Once you have the package installed, you can start using the provided action processors in your `quidproquo`-based application. The library exports a
set of action processors that you can import and use in your code.

## Action Processors

The `quidproquo-actionprocessor-web` library provides the following action processors:

1. **Date/Time Action Processors**:

- `DateNowActionProcessor`: Retrieves the current date and time as an ISO string.

2. **Error Action Processors**:

- `ErrorThrowErrorActionProcessor`: Throws a custom error with a specified type, text, and stack trace.

3. **Event Action Processors**:

- (No event-specific action processors are currently implemented)

4. **GUID Action Processors**:

- `GuidNewActionProcessor`: Generates a new UUID.

5. **Logging Action Processors**:

- `LogCreateActionProcessor`: Logs a message with a specified log level and optional data.

6. **Math Action Processors**:

- `MathRandomNumberActionProcessor`: Generates a random number.

7. **Network Action Processors**:

- `NetworkRequestActionProcessor`: Performs an HTTP request with various options (method, headers, body, etc.).

8. **Platform Action Processors**:

- `PlatformDelayActionProcessor`: Delays the execution for a specified number of milliseconds.

9. **System Action Processors**:

- `SystemBatchActionProcessor`: Executes a batch of actions and returns the results.

10. **User Directory Action Processors**:

- (No user directory-specific action processors are currently implemented)

## Usage

To use the action processors provided by `quidproquo-actionprocessor-web`, you can import them into your `quidproquo`-based application and integrate
them with your action processor configuration. Here's an example of how you might use the `DateNowActionProcessor`:

```typescript
import { DateNowActionProcessor, actionResult, DateActionType } from 'quidproquo-actionprocessor-web';

const processDateNow: DateNowActionProcessor = async () => {
  return actionResult(new Date().toISOString());
};

export default {
  [DateActionType.Now]: processDateNow,
};
```

In this example, we define a `DateNowActionProcessor` function that returns the current date and time as an ISO string. We then export this processor
under the `DateActionType.Now` action type, which can be used in our `quidproquo`-based application.

## Contribution and Development

If you'd like to contribute to the development of `quidproquo-actionprocessor-web`, please refer to the
[contributing guidelines](https://github.com/joe-coady/quidproquo/blob/main/CONTRIBUTING.md) for more information.

## License

`quidproquo-actionprocessor-web` is licensed under the [MIT License](https://github.com/joe-coady/quidproquo/blob/main/LICENSE).

## Warning: Not for Production

**This project is currently under active development and should not be used in production environments. The APIs and functionality are subject to
change without notice.**
