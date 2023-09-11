const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function transformBindMounted(sourceCode){

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

              const vmAssignment = path.get('body.body').find(
                stmt =>
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

  return transformedCode;
}

module.exports = transformBindMounted;
