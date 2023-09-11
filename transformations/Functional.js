const { transformSync } = require('@swc/core');

function transformFunctional(sourceCode){
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
                  }
                },
              });
            }
          },
        },
      };
    },
  }).code;

  return transformedCode;
}

module.exports = transformFunctional;
