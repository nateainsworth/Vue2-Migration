const { transformSync } = require('@swc/core');

function transformHookVNode(sourceCode) {
  try {
  let changeCount = 0; // Initialize a change count variable

  const transformedCode = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformation for changing Vue 2 event syntax to Vue 3 event syntax
    plugin: ($) => {
      return {
        visitor: {
          JSXAttribute(path) {
            if (path.node.name.name === 'hook:mounted') {
              path.node.name.name = 'vnode-mounted';
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

module.exports = transformHookVNode;
