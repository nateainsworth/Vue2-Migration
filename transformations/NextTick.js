const { transformSync } = require('@swc/core');
const { default: transform } = require('@swc/helpers');
const babel = require('@babel/core');

function transformNextTick(sourceCode){
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
            }
          },
        },
      };
    },
  }).code;

  return transformedCode;
}

module.exports = transformNextTick;
