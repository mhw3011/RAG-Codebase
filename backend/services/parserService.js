import fs from "fs";
import parser from "@babel/parser";

export const extractCodeChunks = (filePath) => {
  const code = fs.readFileSync(filePath, "utf-8");

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const chunks = [];

  function traverse(node, parent = null) {
    if (!node) return;

    // Function Declaration
    if (node.type === "FunctionDeclaration") {
      chunks.push({
        type: "function",
        name: node.id?.name || "anonymous",
        code: code.slice(node.start, node.end),
      });
    }

    // Arrow Function / Function Expression
    if (node.type === "VariableDeclaration") {
      node.declarations.forEach((decl) => {
        if (
          decl.init &&
          (decl.init.type === "ArrowFunctionExpression" ||
            decl.init.type === "FunctionExpression")
        ) {
          chunks.push({
            type: "function",
            name: decl.id.name,
            code: code.slice(decl.start, decl.end),
          });
        }
      });
    }

    if (node.type === "ClassDeclaration") {
      chunks.push({
        type: "class",
        name: node.id?.name,
        code: code.slice(node.start, node.end),
      });

      node.body.body.forEach((method) => {
        if (method.type === "ClassMethod") {
          chunks.push({
            type: "method",
            name: method.key.name,
            code: code.slice(method.start, method.end),
          });
        }
      });
    }

    for (const key in node) {
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach((c) => {
          if (c && typeof c.type === "string") {
            traverse(c, node);
          }
        });
      } else if (child && typeof child.type === "string") {
        traverse(child, node);
      }
    }
  }

  traverse(ast);

  return chunks;
};
