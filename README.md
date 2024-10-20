# quid-pro-quo

JS Library for building web servers using pure functions and generators.

## See

- [quidproquo](https://www.npmjs.com/package/quidproquo)
- [quidproquo-core](https://www.npmjs.com/package/quidproquo-core)
- [quidproquo-tsconfig](https://www.npmjs.com/package/quidproquo-tsconfig)
- [quidproquo-webserver](https://www.npmjs.com/package/quidproquo-webserver)
- [quidproquo-web-admin](https://www.npmjs.com/package/quidproquo-web-admin)
- [quidproquo-config-aws](https://www.npmjs.com/package/quidproquo-config-aws)
- [quidproquo-deploy-awscdk](https://www.npmjs.com/package/quidproquo-deploy-awscdk)
- [quidproquo-deploy-webpack](https://www.npmjs.com/package/quidproquo-deploy-webpack)
- [quidproquo-actionprocessor-awslambda](https://www.npmjs.com/package/quidproquo-actionprocessor-awslambda)
- [quidproquo-actionprocessor-node](https://www.npmjs.com/package/quidproquo-actionprocessor-node)

### Note

Currently under development ~ Not for production

#### Todo:

- Remove auth tokens from session, use decoded token
- Use module federation to dynamically load
  - actions
  - stories
  - business logic.
- Move into @quidproquo/\* packaged namespace
- OpenApi support for controllers (validation)

### optimizations:

- Seems that Execute story takes longer then the sum of its action parts by a fair bit
  - investigate this, i suspect it takes time to write the logs, however, logs do not need to be written in sync
    - we can queue them up, and let the owner lambda hold onto them until they are done, so we can do other things
    - it may shave 100ms off function calls

### Cleanup

- apiBuildPath - remove from all configs, pull from just the base config
- aws region being passed into qpqconfig - should be from the awsconfig
- linting / import orders for qpq packages
  - eslint
    - import order
    - linting
    - prettier

#### Must haves

- void response should be 204?
- Remove aws region being passed into QpqConfig
- QPQ Types package ~ Web / Node
- Reduce the log lifetime for lambda to a week or two by default
- Local Dev
- AWS Migration scripts to copy resources between accounts / services
- (if !fedmod logic) - create dynamic loaders for each lambda type to reduce lambda build sizes
- ESLint plugin to make sure user yield\* before an askGenerator

### Federated Module Implementation Attempt

#### Objective

- Develop the business logic on the application side and upload it to S3.
- Use AWS CDK to create generic Lambda functions with a module loader method capable of retrieving client logic from S3, mounting it in the Lambda
  runtime, and executing it via an execution story. This approach ensures that Lambdas remain hot, enables A/B testing, and allows for near-instant
  deployments and rollbacks.

#### Attempts and Challenges

1. **Single JS File with Webpack**:

   - Attempted to build the business logic as a single JavaScript file using Webpack.
   - Created a custom plugin to wrap the output file with a function to evaluate and return exported members.
   - Encountered issues with Webpack bundling, resulting in runtime chunks and separate chunks for services like `reactMediaPlayer`. The concept
     seemed sound, but the execution was unsuccessful.

2. **Module Federation V2**:

   - Tried using Module Federation V2, but faced difficulties in the Node environment.

3. **Custom Runtime Plugin**:
   - Developed a custom runtime plugin but struggled to determine the correct method for mounting downloaded code or streaming from S3.
   - Reference: [Module Federation Plugin](https://module-federation.io/plugin/dev/index.html)
   - Expected a straightforward process of building the business logic with entries exported via federation and dynamically loading them into the
     runtime. However, encountered errors such as `(i.init is not a function)` after significant time investment.

#### Relevant Links

- [Module Federation](https://module-federation.io/)
- [Module Federation Runtime Guide](https://module-federation.io/guide/basic/runtime.html)
- [Next.js SSR Streaming Example](https://github.com/module-federation/nextjs-ssr/blob/main/streaming/src/templates/loadScript.js)

Explored the possibility of dynamically loading JavaScript from S3 using `require` instead of federation. However, Lambda’s limitations on overriding
`require` presented challenges.

#### Future Direction

- Plan to wait for a viable solution, as there is considerable interest in dynamically loading JavaScript from S3 into Lambda, but no reliable
  solutions are currently available.
