const { transformSync } = require('@swc/core');

const propToUpdate = 'title'; // Update with the actual prop name
function transformSyncVModel(sourceCode) {
  try {
  let changeCount = 0; // Initialize a change count variable

  const transformedCode = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformation for changing Vue 2 prop.sync syntax to Vue 3 v-model syntax
    plugin: ($) => {
      return {
        visitor: {
          JSXOpeningElement(path) {
            const attributes = path.node.attributes;
            attributes.forEach(attribute => {
              if (
                attribute.name.name === `:${propToUpdate}.sync` &&
                attribute.value.expression.type === 'Identifier'
              ) {
                attribute.name.name = `v-model:${propToUpdate}`;
                changeCount++; // Increment the change count
              }
            });
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

module.exports = transformSyncVModel;
