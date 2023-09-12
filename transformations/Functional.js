const { transformSync } = require('@swc/core');

function transformFunctional(sourceCode) {
  try {
  let changeCount = 0; // Initialize a change count variable

  const transformedCode = transformSync(sourceCode, {
    // SWC transform options
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformations for removing the functional attribute
    plugin: ($) => {
      return {
        visitor: {
          JSXOpeningElement(path) {
            const { name } = path.node.name;
            if (name.type === 'JSXIdentifier' && name.name === 'template') {
              path.traverse({
                JSXAttribute(attrPath) {
                  const { name } = attrPath.node.name;
                  if (name.type === 'JSXIdentifier' && name.name === 'functional') {
                    // Remove the functional attribute
                    attrPath.remove();
                    changeCount++; // Increment the change count
                  }
                },
              });
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

module.exports = transformFunctional;
