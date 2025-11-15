const { Parser } = require("json2csv");

function generateCSV(data) {
  const parser = new Parser();
  return parser.parse(data);
}

module.exports = generateCSV;
