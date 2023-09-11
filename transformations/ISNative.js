    /* 
    Should replace native components with a custom component creating a file to store the newly created element.
    It then uses a slot to pass in any data inside the original native component tags so variables etc aren't broken 
    although ideally it would be good to have it created props
    */

const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function transformISNative(sourceCode){

  const transformedCode = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformation for changing native elements with "is" attribute
    plugin: ($) => {
      return {
        visitor: {
          JSXOpeningElement(path) {
            const tagName = path.node.name.name;
            const isAttribute = path.node.attributes.find(
              attribute => attribute.name.name === 'is'
            );

            if (isAttribute) {
              const componentName = `${tagName.charAt(0).toUpperCase()}${tagName.slice(1)}Component`;

              // Create a new Vue component file with <slot> content
              const newComponentPath = path.resolve(vueComponentDir, 'components', `${componentName}.vue`);
              fs.writeFileSync(
                newComponentPath,
                `<template>\n  <${tagName}>\n    <slot />\n  </${tagName}>\n</template>`
              );

              // Replace original usage with component import and <slot>
              const componentImport = $.types.importDeclaration(
                [$.types.importDefaultSpecifier($.types.identifier(componentName))],
                $.types.stringLiteral(`./components/${componentName}.vue`)
              );

              const componentProperty = $.types.objectProperty(
                $.types.identifier(componentName),
                $.types.identifier(componentName),
                false,
                true
              );

              path.node.name.name = componentName;
              path.node.attributes = path.node.attributes.filter(
                attribute => attribute !== isAttribute
              );

              // Move original content to the <slot>
              const originalContent = path.parentPath.get('children').filter(child => !$.types.isJSXElement(child));
              if (originalContent.length > 0) {
                path.parentPath.replaceWith(
                  $.types.jsxElement(
                    $.types.jsxOpeningElement(
                      $.types.jsxIdentifier(componentName),
                      [],
                      true
                    ),
                    $.types.jsxClosingElement($.types.jsxIdentifier(componentName)),
                    [
                      $.types.jsxText('\n  '),
                      $.types.jsxExpressionContainer(
                        $.types.jsxText(originalContent.map(child => child.isJSXText() ? child.node.extra.raw : babel.transformSync(child.toString()).code).join('\n'))
                      ),
                      $.types.jsxText('\n  ')
                    ],
                    false
                  )
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

module.exports = transformISNative;
