let Immutable = require('immutable');

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const GRAPHML_HEADER = `<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
  http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">`;
const GRAPHML_HEADER_YED = `<graphml xmlns="http://graphml.graphdrawing.org/xmlns" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:y="http://www.yworks.com/xml/graphml"
  xmlns:yed="http://www.yworks.com/xml/yed/3"
  xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
  http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd">`;
const KEYS_FOR_YED = `<key for="node" id="d6" yfiles.type="nodegraphics"/>`;
const GRAPH_START = '  <graph id="G" edgedefault="undirected">';
const FILE_FOOTER = '\n  </graph>\n</graphml>';

function renderHeader(forYed) {
  return XML_HEADER + '\n' +
    (forYed ? GRAPHML_HEADER_YED : GRAPHML_HEADER) + '\n' +
    (forYed ? `  ${KEYS_FOR_YED}\n` : '') +
    GRAPH_START;
}

function renderFooter() {
  return FILE_FOOTER;
}

function preprocessInputText(inputText) {
  inputText = inputText.replace(/\;/g, '\n');
  inputText = inputText.replace(/\s+\n/g, '\n');
  inputText = inputText.replace(/(\n|\n\r){2,}/g, '\n');
  return inputText;
}

function makeLinesList(inputText) {
  inputText = preprocessInputText(inputText);
  const lines = Immutable.List(inputText.split('\n'))
    .map(line => line.trim())
    .filter(line => !!line && line.length > 0);
  assertFileFormatCorrect(lines);
  return lines;
}

function renderNode(forYed, nodeId) {
  if (forYed) {
    return `<node id="${nodeId}">
      <data key="d6">
        <y:ShapeNode>
          <y:NodeLabel>${nodeId}</y:NodeLabel>
        </y:ShapeNode>
      </data>
    </node>`;
  } else {
    return `<node id="${nodeId}"/>`;
  }
}

function renderNodes(forYed, nodes) {
  return nodes.reduce(
    (acc, nodeId) => `${acc}\n    ` + renderNode(forYed, nodeId), 
    ''
  );
}

function renderEdge(source, target) {
  return `<edge source="${source}" target="${target}"/>`;
}

function renderEdges(arrows) {
  return arrows.reduce((acc, arrow) => {
    let [source, target] = arrow.split('-->');
    return `${acc}\n    ` + renderEdge(source, target);
  }, '');
}

function assertFileFormatCorrect(lines) {
  if (lines.get(0).search(/^graph /gi) < 0) {
    throw new Error('Input file should start with a line defining ' +
      '`graph __`.\nFound line \n  ' + lines.get(0) + '\ninstead.');
  }
}

function renderOutputText(forYed, inputText) {
  let lines = makeLinesList(inputText);
  let arrows = lines.shift(); // remove first line
  let nodes = arrows
    .flatMap(arrow => arrow.split('-->'))
    .toSet();
  return renderHeader(forYed) + 
    renderNodes(forYed, nodes) + 
    renderEdges(arrows) + 
    renderFooter();
}

module.exports = renderOutputText;
