# quidproquo-deploy-awscdk

The `quidproquo-deploy-awscdk` library is a key component of the quidproquo framework, providing a set of constructs and utilities for deploying
quidproquo-based applications on the AWS Cloud using the AWS CDK (Cloud Development Kit).

## WARNING: NOT FOR PRODUCTION

**This project is currently under active development and should not be used in production environments. The APIs and functionality are subject to
change without notice.**

## Key Features

1. **Construct-based Deployment**: The `quidproquo-deploy-awscdk` library provides a set of custom constructs that encapsulate the deployment of
   various quidproquo components, such as APIs, queues, storage drives, and more, on the AWS platform.

2. **Seamless Integration**: The constructs in this library are designed to work seamlessly with the core quidproquo functionality, ensuring a
   consistent and cohesive development experience.

3. **Extensibility**: The library is designed to be highly extensible, allowing developers to create custom constructs or modify existing ones to meet
   their specific requirements.

4. **Automated Provisioning**: The library handles the provisioning of various AWS resources, such as Lambda functions, API Gateways, DynamoDB tables,
   and more, based on the quidproquo configuration.

5. **Dependency Management**: The library manages the dependencies between various quidproquo components, ensuring that the deployment process is
   efficient and reliable.

6. **Logging and Observability**: The library integrates with the quidproquo logging and observability features, ensuring that deployment-related logs
   and metrics are captured and made available for monitoring and troubleshooting.

7. **Reusable Constructs**: The library provides a set of reusable constructs that can be used across multiple quidproquo-based applications,
   promoting code reuse and consistency.

## Key Concepts

1. **Constructs**: Constructs are the fundamental building blocks of the `quidproquo-deploy-awscdk` library. They represent the various AWS resources
   and configurations required to deploy a quidproquo-based application.

2. **Stacks**: Stacks are higher-level constructs that group related resources and configurations together, ensuring a cohesive and organized
   deployment process.

3. **Dependency Management**: The library manages the dependencies between various quidproquo components, ensuring that the deployment process is
   efficient and reliable.

4. **Naming Conventions**: The library follows a consistent naming convention for the provisioned AWS resources, ensuring that they are easily
   identifiable and traceable.

5. **Extensibility**: The library is designed to be highly extensible, allowing developers to create custom constructs or modify existing ones to meet
   their specific requirements.

6. **Logging and Observability**: The library integrates with the quidproquo logging and observability features, ensuring that deployment-related logs
   and metrics are captured and made available for monitoring and troubleshooting.

7. **Reusable Constructs**: The library provides a set of reusable constructs that can be used across multiple quidproquo-based applications,
   promoting code reuse and consistency.

## Getting Started

To use the `quidproquo-deploy-awscdk` library, you'll need to install the package and its dependencies. You can do this using your preferred package
manager, such as npm or yarn:

```
npm install quidproquo-deploy-awscdk
```

Once you have the package installed, you can start building your quidproquo-based applications on the AWS platform, leveraging the constructs and
utilities provided by this library.

## Documentation

For more detailed information on using the `quidproquo-deploy-awscdk` library, please refer to the
[quidproquo-deploy-awscdk documentation](https://github.com/joe-coady/quidproquo/tree/main/packages/quidproquo-deploy-awscdk).

## Contributing

If you'd like to contribute to the development of `quidproquo-deploy-awscdk`, please refer to the
[contributing guidelines](https://github.com/joe-coady/quidproquo/blob/main/CONTRIBUTING.md) for more information.

## License

`quidproquo-deploy-awscdk` is licensed under the [MIT License](https://github.com/joe-coady/quidproquo/blob/main/LICENSE).
