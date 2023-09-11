const { transformSync } = require('@swc/core');

function  transformBeforeDestroy(sourceCode){

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
                .find(property => property.node.key.name === 'beforeDestroy');
              const destroyed = declaration
                .get('properties')
                .find(property => property.node.key.name === 'destroyed');

              if (beforeDestroy) {
                beforeDestroy.node.key.name = 'beforeUnmount';
              }

              if (destroyed) {
                destroyed.node.key.name = 'unmounted';
              }
            }
          },
        },
      };
    },
  }).code;

  return transformedCode;
}

module.exports = transformBeforeDestroy;
