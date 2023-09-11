const { transformSync } = require('@swc/core');

function transformVSlot(sourceCode){
  const transformedCode = transformSync(sourceCode, {
    // SWC transform options
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformations for updating the slot syntax
    plugin: ($) => {
      return {
        visitor: {
          JSXOpeningElement(path) {
            const { name } = path.node.name;
            if (name.type === 'JSXIdentifier' && name.name === 'template') {
              path.traverse({
                JSXAttribute(attrPath) {
                  const { name, value } = attrPath.node.name;
                  if (name.type === 'JSXIdentifier' && value && value.type === 'StringLiteral') {
                    if (name.name === 'slot') {
                      const slotName = value.value;
                      const newSlotName = `#${slotName}`;
                      value.value = newSlotName;
                    } else if (name.name === 'slot-scope') {
                      const slotScopeVar = value.value;
                      const newSlotScope = `"${slotScopeVar}" as ${slotScopeVar}`;
                      value.value = newSlotScope;
                    }
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

module.exports = transformVSlot;
