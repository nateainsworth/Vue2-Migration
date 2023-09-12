const { transformSync } = require('@swc/core');
const { default: transform } = require('@swc/helpers');
const babel = require('@babel/core');

function transformNextTick(sourceCode) {
  try {
  let changeCount = 0; // Initialize a change count variable

  const transformedCode = transformSync(sourceCode, {
    // SWC transform options
    jsc: {
      parser: {
        syntax: 'typescript',
      },
    },
    // Custom transformations for changing $nextTick to nextTick
    plugin: ($) => {
      return {
        visitor: {
          CallExpression(path) {
            if (
              path.get('callee').isMemberExpression() &&
              path.get('callee.object').isThisExpression() &&
              path.get('callee.property').isIdentifier({ name: '$nextTick' })
            ) {
              // Transform to import { nextTick } from 'vue'
              const newNode = babel.parseSync(
                "import { nextTick } from 'vue'",
                {
                  sourceType: 'module',
                  plugins: ['jsx'],
                  configFile: false,
                  presets: ['@babel/preset-env'],
                }
              );
              const transformedNode = transform(newNode);
              path.parentPath.replaceWithMultiple(
                transformedNode.declarations[0].init.arguments[0].body.body
              );
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

module.exports = transformNextTick;
