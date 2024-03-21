# quidproquo-core

The `quidproquo-core` library is the heart of the quidproquo framework. It provides the fundamental building blocks and abstractions that enable the creation of scalable, event-driven web applications. This library is not intended to be used directly, but rather serves as a foundation for other quidproquo packages.

## WARNING: NOT FOR PRODUCTION

**This project is currently under active development and should not be used in production environments. The APIs and functionality are subject to change without notice.**

## Key Features

1. **Action-Oriented Architecture**: The core of quidproquo-core is an action-oriented architecture, where all application logic is encapsulated in small, reusable actions. These actions can be composed together to create complex workflows.

2. **Asynchronous Execution**: Actions in quidproquo-core are executed asynchronously using generators, allowing for efficient and non-blocking execution of application logic.

3. **Dependency Injection**: The framework provides a built-in dependency injection system, allowing for easy composition and testing of application components.

4. **Extensibility**: The core library is designed to be highly extensible, with well-defined extension points and a modular architecture.

5. **Error Handling**: The framework includes a robust error handling system, with support for different error types and the ability to handle errors at various levels of the application.

6. **Logging and Observability**: The core library provides built-in support for logging and observability, making it easier to debug and monitor applications built with quidproquo.

7. **Testability**: The action-oriented architecture and asynchronous execution model of quidproquo-core make it highly testable, with support for unit, integration, and end-to-end testing.

## Key Concepts

1. **Actions**: Actions are the fundamental building blocks of quidproquo-core. They represent small, reusable pieces of application logic that can be composed together to create complex workflows.

2. **Generators**: Generators are used to implement the asynchronous execution model of quidproquo-core. Actions are defined as generator functions, which can yield other actions or return values.

3. **Dependency Injection**: The core library provides a built-in dependency injection system, allowing for easy composition and testing of application components.

4. **Contexts**: Contexts are used to manage the state and dependencies of a particular execution context, such as a user session or a background task.

5. **Errors**: The framework includes a robust error handling system, with support for different error types and the ability to handle errors at various levels of the application.

6. **Logging and Observability**: The core library provides built-in support for logging and observability, making it easier to debug and monitor applications built with quidproquo.

7. **Testing**: The action-oriented architecture and asynchronous execution model of quidproquo-core make it highly testable, with support for unit, integration, and end-to-end testing.

## Getting Started

To use quidproquo-core, you'll need to install the package and its dependencies. You can do this using your preferred package manager, such as npm or yarn:

```
npm install quidproquo-core
```

Once you have the package installed, you can start building your application using the core concepts and features provided by the library.

## Documentation

For more detailed information on using quidproquo-core, please refer to the [quidproquo-core documentation](https://github.com/joe-coady/quidproquo/tree/main/packages/quidproquo-core).

## Contributing

If you'd like to contribute to the development of quidproquo-core, please refer to the [contributing guidelines](https://github.com/joe-coady/quidproquo/blob/main/CONTRIBUTING.md) for more information.

## License

quidproquo-core is licensed under the [MIT License](https://github.com/joe-coady/quidproquo/blob/main/LICENSE).