const estraverse = require("estraverse");

const WEIRD = true;
const WEIRD_LITERALS = true;
const VAR_PREFIX = "WEIRD_LITERAL_";

function mangle(ast) {
  // Collect literals;
  const literals = new Map();
  let blockDepth = 0;

  function getLiteralIdentifier(value) {
    let name;
    if (literals.has(value)) {
      name = literals.get(value);
    } else {
      name = `${VAR_PREFIX}${literals.size}`;
      literals.set(value, name);
    }
    return {
      type: "Identifier",
      name,
    };
  }

  function enter(node, parent) {
    if (!WEIRD) {
      console.dir({ node, parent });
      return;
    }
    // Swap all literals out for identifiers
    switch (node.type) {
      case "Literal":
        if (WEIRD_LITERALS) {
          return getLiteralIdentifier(node.value);
        }
      case "BlockStatement":
        blockDepth++;
        break;
    }
  }

  function leave(node, parent) {
    if (!WEIRD_LITERALS) {
      return;
    }

    switch (node.type) {
      case "BlockStatement":
        blockDepth--;
        if (blockDepth === 0) {
          const declarations = [];
          literals.forEach((value, key) => {
            if (typeof key === "string") {
              key = JSON.stringify(key);
            }

            declarations.push({
              type: "VariableDeclarator",
              id: { type: "Identifier", name: value },
              init: { type: "Identifier", name: key },
            });
          });
          const vars = {
            type: "VariableDeclaration",
            declarations,
            kind: "var",
          };
          if (declarations.length > 0) {
            node.body.unshift(vars);
          }
          literals.clear();
        }

        break;
      case "MemberExpression":
        if (!node.computed) {
          const propertyName = node.property.name;
          node.computed = true;
          node.property = getLiteralIdentifier(propertyName);
        }
        break;
    }
  }

  estraverse.replace(ast, {
    enter,
    leave,
  });
}

module.exports = mangle;
