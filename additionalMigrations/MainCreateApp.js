const fs = require('fs');
const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function migrateMainCreateApp(){
  const filePath = 'path/to/main.js'; // Update with the actual path
  const sourceCode = fs.readFileSync(filePath, 'utf-8');

  const transformedCode = transformSync(sourceCode, {
    // SWC transform options
    jsc: {
      parser: {
        syntax: 'typescript',
      },
    },
    // Custom transformations for updating Vue 2 to Vue 3 and .use() statements
    plugin: ($) => {
      return {
        visitor: {
          ImportDeclaration(path) {
            const importSource = path.node.source.value;
            if (importSource === 'vue') {
              path.node.source.value = 'vue'; // Update the import source

              path.node.specifiers = path.node.specifiers.filter(specifier => {
                return specifier.local.name === 'Vue';
              }); // Keep only the specifier for Vue
            }
          },
          CallExpression(path) {
            const callee = path.get('callee');
            if (callee.isMemberExpression()) {
              const objectName = callee.get('object').node.name;
              const propertyName = callee.get('property').node.name;

              if (objectName === 'Vue' && propertyName === 'use') {
                callee.get('object').node.name = 'app';
              }
            }
          },
          MemberExpression(path) {
            const objectName = path.get('object').node.name;
            const propertyName = path.get('property').node.name;

            if (objectName === 'Vue' && propertyName === 'directive') {
              path.get('object').node.name = 'app';
            }
          },
          AssignmentExpression(path) {
            const left = path.get('left');
            if (left.isMemberExpression()) {
              const objectName = left.get('object').node.name;
              const propertyName = left.get('property').node.name;

              if (objectName === 'Vue.prototype' && propertyName.startsWith('$')) {
                left.get('object').node.name = 'app.config.globalProperties';
                left.get('property').node.name = propertyName.slice(1);
              }
            }
          },
        },
      };
    },
  }).code;

  return transformedCode;
}

module.exports = migrateMainCreateApp;