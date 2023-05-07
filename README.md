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

- Update config to support nested arrays
- Use module federation to dynamically load
  - actions
  - stories
  - business logic.
- Auth support
- Retry support for actions
- Action logging
- Sort out package versions (don't use \*)
- Tests
- Create QPQ App
- Move into @quidproquo/\* packaged namespace
- Environment config support ~ Specifically dev / prod config parameters.
- OpenApi support for controllers (validation)
- share the action processor logic between lambdas (+ general cleanup)

#### Must haves

- QPQ Types package ~ Web / Node
- Reduce the log lifetime for lambda to a week or two by default
- Finish auth
- Local Dev
- import html file as strings for email templates
- key value store powered by dynamo / s3
- Add monad support to actions (allow return with error info)
- eslint
  - import order
  - linting
  - prettier
- Set secrets script
- AWS Migration scripts to copy resources between accounts / services
- (if !fedmod logic) - create dynamic loaders for each lambda type to reduce lambda build sizes
- ESLint plugin to make sure user yield\* before an askGenerator
- keep lambda's warm by adding a polling event every x mins
