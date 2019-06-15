# rollup-plugin-package-logger

Dependencies logging plugin to carefully analyze what's in your apps.

## Usage

```js
import nodeResolve from 'rollup-plugin-node-resolve';
import { packagesLogger } from 'rollup-plugin-packages-logger';

export default {
  ...
  plugins: [
    // note: this plugin should be placed first
    packagesLogger(),
    nodeResolve()
  ]
}
```

## Options

**showPackages**

By default this plugin logs only count of packages. This option enables logging packages list.

**showImports**

Enable logging sub imports like `isEqual` in `lodash/isEqual` import.

**showDependentPackages**

Enable logging dependent packages per each package (or path import).
