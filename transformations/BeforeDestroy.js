const { transformSync } = require('@swc/core');

function transformBeforeDestroy(sourceCode) {
  try {
  let changeCount = 0; // Initialize a change count variable

  const transformedCode = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformation for changing Vue 2 lifecycle hooks to Vue 3 lifecycle hooks
    plugin: ($) => {
      return {
        visitor: {
          ExportDefaultDeclaration(path) {
            const declaration = path.get('declaration');
            if (declaration.isObjectExpression()) {
              const beforeDestroy = declaration
                .get('properties')
                .find((property) => property.node.key.name === 'beforeDestroy');
              const destroyed = declaration
                .get('properties')
                .find((property) => property.node.key.name === 'destroyed');

              if (beforeDestroy) {
                beforeDestroy.node.key.name = 'beforeUnmount';
                changeCount++; // Increment the change count
              }

              if (destroyed) {
                destroyed.node.key.name = 'unmounted';
                changeCount++; // Increment the change count
              }
            }
          },
        },
      };
    },
  }).code;

  return {
    transformedCode,
    changeCount,
    error: null, // No error
  };
} catch (error) {
  return {
    transformedCode: sourceCode,
    changeCount: 0,
    error,
  };
}
}

module.exports = transformBeforeDestroy;
