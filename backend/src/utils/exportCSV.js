const { Parser } = require("json2csv");

function exportCSV(data, res, filename) {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.csv"`
    );

    return res.status(200).end(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = exportCSV;
