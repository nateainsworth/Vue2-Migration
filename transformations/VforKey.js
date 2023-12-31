const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function transformVForKey(sourceCode) {
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
    // Custom transformations for removing duplicated :key attributes
    plugin: ($) => {
      const keyAttributesMap = new Map();

      return {
        visitor: {
          JSXElement(path) {
            const openingElement = path.get('openingElement');
            if (!openingElement.isJSXOpeningElement()) return;

            const attributes = openingElement.get('attributes');
            const vForAttribute = attributes.find((attr) => {
              const attrName = attr.get('name');
              return (
                attrName.isJSXIdentifier() &&
                attrName.node.name === 'v-for'
              );
            });

            if (vForAttribute) {
              const vForExpression = vForAttribute.get('value').get('expression').node;
              const keyAttribute = attributes.find((attr) => {
                const attrName = attr.get('name');
                return (
                  attrName.isJSXIdentifier() &&
                  attrName.node.name === 'key'
                );
              });

              if (keyAttribute) {
                const keyAttributeValue = keyAttribute.get('value').get('expression').node;
                if (!keyAttributesMap.has(vForExpression)) {
                  keyAttributesMap.set(vForExpression, keyAttributeValue);
                  keyAttribute.remove();
                  openingElement.attributes.push(
                    babel.types.jsxAttribute(
                      babel.types.jsxIdentifier(':key'),
                      keyAttributeValue
                    )
                  );
                  changeCount++; // Increment the change count
                } else {
                  keyAttribute.remove();
                }
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

module.exports = transformVForKey;
