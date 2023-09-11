const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function transformExtendDefineComp(sourceCode){

  const transformedCode = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformation for changing Vue.extend() to defineComponent()
    plugin: ($) => {
      return {
        visitor: {
          ImportDeclaration(path) {
            const importSource = path.node.source.value;
            if (importSource === 'vue') {
              const specifier = path.node.specifiers.find(spec => spec.local.name === 'Vue');
              if (specifier) {
                specifier.local.name = 'defineComponent';
                path.node.source.value = 'vue';
              }
            }
          },
          ExportDefaultDeclaration(path) {
            const declaration = path.node.declaration;
            if (
              declaration.type === 'CallExpression' &&
              declaration.callee.type === 'MemberExpression' &&
              declaration.callee.object.name === 'Vue' &&
              declaration.callee.property.name === 'extend'
            ) {
              declaration.callee.object.name = 'defineComponent';
            }
          },
        },
      };
    },
  }).code;

  return transformedCode;
}

module.exports = transformExtendDefineComp;
