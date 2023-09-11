const { transformSync } = require('@swc/core');

function transformHookVNode(sourceCode){
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
            }
          },
        },
      };
    },
  }).code;

  return transformedCode;
}

module.exports = transformHookVNode;
