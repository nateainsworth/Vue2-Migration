const { transformSync } = require('@swc/core');

function transformVSlot(sourceCode) {
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
                      if (newSlotName !== value.value) {
                        value.value = newSlotName;
                        changeCount++; // Increment the change count
                      }
                    } else if (name.name === 'slot-scope') {
                      const slotScopeVar = value.value;
                      const newSlotScope = `"${slotScopeVar}" as ${slotScopeVar}`;
                      if (newSlotScope !== value.value) {
                        value.value = newSlotScope;
                        changeCount++; // Increment the change count
                      }
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

module.exports = transformVSlot;
