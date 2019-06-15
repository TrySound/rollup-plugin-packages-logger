const path = require('path');

const isExternal = id =>
  // rollup specific id
  id.startsWith('\0') === false &&
  // relative id
  id.startsWith('.') === false &&
  // absolute id
  path.isAbsolute(id) === false;

const getPackageName = id => {
  return (
    id
      .split('/')
      // consider scoped packages
      .slice(0, id.startsWith('@') ? 2 : 1)
      .join('/')
  );
};

const getPathImport = id => {
  return (
    id
      .split('/')
      // consider scoped packages
      .slice(id.startsWith('@') ? 2 : 1)
      .join('/')
  );
};

const findFullPathPackageName = id => {
  const token = 'node_modules/';
  const index = id.indexOf(token);
  if (index !== -1) {
    return getPackageName(id.slice(index + token.length));
  } else {
    return '';
  }
};

const renderList = (indent, list) =>
  list.map(item => '\n' + '  '.repeat(indent) + item).join('');

const packagesLogger = ({
  showPackages = false,
  showPathImports = false,
  showDependentPackages = false,
} = {}) => {
  const packagesSet = new Set();
  const pathImportsMap = new Map();
  const dependentPackagesMap = new Map();

  const renderDependentPackages = (indent, name) => {
    const dependents = Array.from(dependentPackagesMap.get(name)).sort();
    if (dependents.length !== 0) {
      return renderList(indent, dependents);
    } else {
      return '';
    }
  };

  const renderPathImports = (indent, name) => {
    const imports = Array.from(pathImportsMap.get(name)).sort();
    if (imports.length !== 0) {
      return renderList(
        indent,
        imports.map(d => {
          if (showDependentPackages) {
            return d + renderDependentPackages(indent + 1, `${name}/${d}`);
          } else {
            return d;
          }
        }),
      );
    } else {
      return '';
    }
  };

  const renderPackages = indent => {
    const packages = Array.from(packagesSet).sort();
    return renderList(
      indent,
      packages.map(name => {
        if (showPathImports) {
          return name + renderPathImports(indent + 1, name);
        }
        if (showDependentPackages) {
          return name + renderDependentPackages(indent + 1, name);
        }
        return name;
      }),
    );
  };

  return {
    resolveId(importee, importer) {
      if (isExternal(importee)) {
        const packageName = getPackageName(importee);
        const pathImport = getPathImport(importee);
        const dependentPackageName = findFullPathPackageName(importer);
        packagesSet.add(packageName);

        if (pathImportsMap.has(packageName) === false) {
          pathImportsMap.set(packageName, new Set());
        }
        // ignore importee without path imports
        if (pathImport.length !== 0) {
          pathImportsMap.get(packageName).add(pathImport);
        }

        const dependencyName = showPathImports ? importee : packageName;
        if (dependentPackagesMap.has(dependencyName) === false) {
          dependentPackagesMap.set(dependencyName, new Set());
        }
        if (dependentPackageName.length !== 0) {
          dependentPackagesMap.get(dependencyName).add(dependentPackageName);
        }
      }
    },
    generateBundle() {
      console.info('\n----------');
      if (showPackages && packagesSet.size !== 0) {
        console.info(renderPackages(1));
        console.info('\n----------');
      }
      console.info(`\n  ${packagesSet.size} packages are used in app`);
      console.info('\n----------\n');
    },
  };
};

exports.packagesLogger = packagesLogger;
