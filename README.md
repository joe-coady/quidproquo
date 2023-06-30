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

- Use module federation to dynamically load
  - actions
  - stories
  - business logic.
- Retry support for actions
- Action logging
- Sort out package versions (don't use \*)
- Tests
- Create QPQ App
- Move into @quidproquo/\* packaged namespace
- OpenApi support for controllers (validation)
- share the action processor logic between lambdas (+ general cleanup)

### optimizations:

- Seems that Execute story takes longer then the sum of its action parts by a fair bit
  - investigate this, i suspect it takes time to write the logs, however, logs do not need to be
    written in sync
    - we can queue them up, and let the owner lambda hold onto them until they are done, so we can
      do other things
    - it may shave 100ms off function calls

#### Must haves

- QPQ Types package ~ Web / Node
- Reduce the log lifetime for lambda to a week or two by default
- Finish auth
- Local Dev
- import html file as strings for email templates
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

#### OOOOHHHH Thoughts

- Try catch support ~ Think about this

```
yield* askTryCatch(
    askSomeBusinessFunc,
    [arg1, arg2],
    function* onError(error: Error) {
      yield* askLogCreate(LogLevelEnum.Error, 'Something went wrong', error);
      yield* askThrowError(ErrorTypeEnum.GenericError, 'Something went wrong');
    }
  );
```
