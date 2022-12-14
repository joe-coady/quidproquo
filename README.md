# quid-pro-quo

JS Library for building web servers using pure functions and generators.

## See

- [quidproquo](https://www.npmjs.com/package/quidproquo)
- [quidproquo-core](https://www.npmjs.com/package/quidproquo-core)
- [quidproquo-tsconfig](https://www.npmjs.com/package/quidproquo-tsconfig)
- [quidproquo-webserver](https://www.npmjs.com/package/quidproquo-webserver)
- [quidproquo-deploy-awscdk](https://www.npmjs.com/package/quidproquo-deploy-awscdk)
- [quidproquo-deploy-webpack](https://www.npmjs.com/package/quidproquo-deploy-webpack)
- [quidproquo-actionprocessor-awslambda](https://www.npmjs.com/package/quidproquo-actionprocessor-awslambda)
- [quidproquo-actionprocessor-node](https://www.npmjs.com/package/quidproquo-actionprocessor-node)

### Note

Currently under development ~ Not for production

#### Todo:

- Clean up CDK ~ Create constructs library
- Update config to support nested arrays
- Use module federation to dynamically load
  - actions
  - stories
  - business logic.
- Auth support
- General cleanup / folder restructure
- Retry support for actions
- Action logging
- Sort out package versions (don't use \*)
- OpenApi support for controllers (validation)
- Move lambda config from env variables (it does not scale) - aws param store with cache
- Tests
- Create QPQ App
- Move into @quidproquo/\* packaged namespace
- Multi service support
- Environment config support ~ Specifically dev / prod config parameters.
- Event support ( cross service / internal )
