const { transformSync } = require('@swc/core');
const babel = require('@babel/core');

function transformFiltering(sourceCode){

  const transformedCode = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
        plugins: ['jsx'],
      },
    },
    // Custom transformation for changing Vue 2 filters to Vue 3 computed or methods
    plugin: ($) => {
      return {
        visitor: {
          TemplateElement(path) {
            const sourceValue = path.node.value.raw;

            const filterRegex = /{{\s*(\w+)\s*\|\s*(\w+)\s*}}/g;
            let match = filterRegex.exec(sourceValue);

            while (match) {
              const fullMatch = match[0];
              const variableName = match[1];
              const filterName = match[2];

              const computedName = `uppercased${variableName.charAt(0).toUpperCase()}${variableName.slice(1)}`;

              // Update the template
              path.node.value.raw = path.node.value.raw.replace(fullMatch, `{{ ${computedName} }}`);

              // Add computed property if it doesn't exist
              if (!$.types.jsxAttribute(computedName)) {
                const computedProperty = $.types.jsxAttribute(
                  $.types.jsxIdentifier(computedName),
                  $.types.jsxExpressionContainer(
                    $.types.arrowFunctionExpression(
                      [],
                      $.types.blockStatement([
                        $.types.returnStatement(
                          $.types.callExpression(
                            $.types.memberExpression(
                              $.types.memberExpression(
                                $.types.thisExpression(),
                                $.types.identifier(variableName)
                              ),
                              $.types.identifier(filterName)
                            ),
                            []
                          )
                        ),
                      ])
                    )
                  )
                );

                const component = path.findParent(
                  parentPath => parentPath.isExportDefaultDeclaration()
                );

                const computedProperties = component.node.declaration.properties.find(
                  prop => prop.key.name === 'computed'
                );

                if (computedProperties) {
                  computedProperties.value.properties.push(computedProperty);
                } else {
                  component.node.declaration.properties.push(
                    $.types.objectProperty(
                      $.types.identifier('computed'),
                      $.types.objectExpression([computedProperty])
                    )
                  );
                }
              }

              match = filterRegex.exec(sourceValue);
            }
          },
        },
      };
    },
  }).code;

  return transformedCode;
}

module.exports = transformFiltering;
