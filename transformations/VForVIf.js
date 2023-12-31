const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function transformVForVIf(sourceCode){
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
    // Custom transformations for moving v-if using v-for variable
    plugin: ($) => {
      return {
        visitor: {
          JSXElement(path) {
            const openingElement = path.get('openingElement');
            if (!openingElement.isJSXOpeningElement()) return;

            const attributes = openingElement.get('attributes');
            const ifAttribute = attributes.find((attr) => {
              const attrName = attr.get('name');
              const attrValue = attr.get('value').get('expression');
              return (
                attrName.isJSXIdentifier() &&
                attrName.node.name === 'v-if' &&
                attrValue.isIdentifier() &&
                attrValue.node.name === vForVariable
              );
            });

            if (ifAttribute) {
              const ifValue = ifAttribute.get('value').get('expression').node;
              ifAttribute.remove();

              const newTemplate = babel.parseSync(
                `<template v-if="${ifValue}">
                  ${path.node.openingElement.toSource()}
                  ${path.node.closingElement.toSource()}
                </template>`,
                {
                  sourceType: 'module',
                  plugins: ['jsx'],
                }
              );

              path.replaceWith(newTemplate.program.body[0]);

              // Increment the change count
              changeCount++;
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

module.exports = transformVForVIf;
