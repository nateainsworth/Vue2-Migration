const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function transformExtendDefineComp(sourceCode) {
  try {
  let changeCount = 0; // Initialize a change count variable

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
              const specifier = path.node.specifiers.find((spec) => spec.local.name === 'Vue');
              if (specifier) {
                specifier.local.name = 'defineComponent';
                path.node.source.value = 'vue';
                changeCount++; // Increment the change count
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
              changeCount++; // Increment the change count
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

module.exports = transformExtendDefineComp;
