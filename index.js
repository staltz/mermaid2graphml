#!./node_modules/.bin/babel-node

let packageJson = require('./package.json');
let commander = require('commander');
let renderOutputText = require('renderer');
let fs = require('fs');

function getProgramOptions(program) {
  if (!program.args || !program.args[0] || !program.args[1]) {
    program.help();
    process.exit();
  }
  const inputFile = program.args[0];
  const outputFile = program.args[1];
  const forYed = !!program.yed;
  return [inputFile, outputFile, forYed];
}

function alertError(err) {
  console.log(err.toString());
  process.exit();
}

function readInputWriteOutput(inputFile, outputFile, forYed, doneCb) {
  fs.readFile(inputFile, 'utf8', function (err, data) {
    if (err) { alertError(err); }

    let outputText;
    try { outputText = renderOutputText(forYed, data); }
    catch (err) { alertError(err); }

    fs.writeFile(outputFile, outputText, function (err) {
      if (err) { alertError(err); }

      if (doneCb) {
        doneCb();
      }
    });
  });
}

(function main() {
  let program = new commander.Command(packageJson.name);
  program
    .version(packageJson.version)
    .description(packageJson.description)
    .usage('[options] <mermaid input text...> <output ...>')
    .option('-y, --yed', 'Optimize for yEd (Graph GUI tool from yWorks)')
    .parse(process.argv);
  let [inputFile, outputFile, forYed] = getProgramOptions(program);
  readInputWriteOutput(inputFile, outputFile, forYed);
})();
