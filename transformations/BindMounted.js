const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function transformBindMounted(sourceCode) {
  try {
  let changeCount = 0; // Initialize a change count variable

  const transformedCode = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
      },
    },
    // Custom transformation for changing Vue 2 lifecycle hooks to Vue 3 lifecycle hooks
    plugin: ($) => {
      return {
        visitor: {
          FunctionDeclaration(path) {
            if (path.node.id.name === 'bind') {
              path.node.id.name = 'mounted';
              changeCount++; // Increment the change count

              const vmAssignment = path.get('body.body').find(
                (stmt) =>
                  stmt.type === 'VariableDeclaration' &&
                  stmt.declarations[0].id.name === 'vm'
              );

              if (vmAssignment) {
                vmAssignment.declarations[0].init = $.types.memberExpression(
                  $.types.memberExpression(
                    $.types.identifier('binding'),
                    $.types.identifier('instance')
                  ),
                  $.types.identifier('instance')
                );
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

module.exports = transformBindMounted;
