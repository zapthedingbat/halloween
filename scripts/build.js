const fs = require("fs");
const path = require("path");
const esprima = require("esprima");
const escodegen = require("escodegen");
const esmangle = require("esmangle");
const esshorten = require("esshorten");
const esshortenUtility = require("esshorten/lib/utility");
const mangle = require("./mangle");
const generateNextName = require("./generate-next-name");

function mangleFile(inputJsPath, outputJsPath) {
  const input = fs.readFileSync(inputJsPath, "utf8");
  let ast = esprima.parse(input);

  mangle(ast);

  const gnn = esshortenUtility.generateNextName;
  esshortenUtility.generateNextName = generateNextName;
  ast = esmangle.optimize(ast, null);
  ast = esshorten.mangle(ast);
  esshortenUtility.generateNextName = gnn;

  const output = escodegen.generate(ast, {
    format: {
      renumber: true,
      hexadecimal: true,
      escapeless: true,
      compact: true,
      semicolons: false,
      parentheses: false,
    },
  });

  const fileDescriptor = fs.openSync(outputJsPath, "w");
  fs.appendFileSync(fileDescriptor, output, "utf8");
}

function appendToImage(inputFilePath, outputFilePath) {
  const jpegHeader = fs.readFileSync(
    path.resolve(__dirname, "assets/jpeg.jpg"),
    "binary"
  );
  const input = fs.readFileSync(inputFilePath);
  const fileDescriptor = fs.openSync(outputFilePath, "w");
  fs.appendFileSync(fileDescriptor, jpegHeader, "binary");
  fs.appendFileSync(fileDescriptor, input);
}

fs.mkdir(path.resolve(__dirname, "../dist"), function (err) {
  // Mangle the load
  mangleFile(
    path.resolve(__dirname, "../src/client/load.js"),
    path.resolve(__dirname, "../dist/load.weird.js")
  );

  // Mangle the client
  mangleFile(
    path.resolve(__dirname, "../src/client/client.js"),
    path.resolve(__dirname, "../dist/client.weird.js")
  );

  // Append the client to the image
  appendToImage(
    path.resolve(__dirname, "../dist/client.weird.js"),
    path.resolve(__dirname, "../dist/client.weird.jpg")
  );

  // Remove the client js
  fs.unlinkSync(path.resolve(__dirname, "../dist/client.weird.js"));
});
