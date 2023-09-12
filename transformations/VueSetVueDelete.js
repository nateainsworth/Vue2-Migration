const { transformSync } = require('@swc/core');

function transformVueSetVueDelete(sourceCode) {
  try {
  let changeCount = 0; // Initialize a change count variable

  const transformedCode = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformation for changing Vue 2 patterns to Vue 3 patterns
    plugin: ($) => {
      return {
        visitor: {
          CallExpression(path) {
            const callee = path.get('callee');
            if (callee.isMemberExpression()) {
              const objectName = callee.get('object').node.name;
              const propertyName = callee.get('property').node.name;
              const args = path.get('arguments');

              if (objectName === 'Vue' || objectName === 'vm') {
                if (propertyName === 'set' && args.length === 3) {
                  const target = args[0].getSource();
                  const key = args[1].getSource();
                  const value = args[2].getSource();

                  const newCode = `${target}.${key} = ${value}`;
                  if (newCode !== path.getSource()) {
                    path.replaceWithSourceText(newCode);
                    changeCount++; // Increment the change count
                  }
                } else if (propertyName === 'delete' && args.length === 2) {
                  const target = args[0].getSource();
                  const key = args[1].getSource();

                  const newCode = `delete ${target}.${key}`;
                  if (newCode !== path.getSource()) {
                    path.replaceWithSourceText(newCode);
                    changeCount++; // Increment the change count
                  }
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

module.exports = transformVueSetVueDelete;
