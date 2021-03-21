function updateChartDataRange() {
  const currTopChartRow = getCurrentStartingChartRow();
  const newTopChartRow = getNewStartingChartRow(currTopChartRow);

  const cell = getCell(CHART_DATA_SHEET_NAME, "A2");

  const newFormula = cell.getFormula().replace(currTopChartRow, newTopChartRow);
  cell.setFormula(newFormula);
}

function getCurrentStartingChartRow() {
  const cell = getCell(CHART_DATA_SHEET_NAME, "A2");
  const currFormula = cell.getFormula();

  const currTopCellFinder = new RegExp(`${LOG_SHEET_NAME}!A(\\d+):`);
  const currTopCell = currFormula.match(currTopCellFinder);
  return parseInt(currTopCell[1], 10)
}

function getNewStartingChartRow(currTopChartRow) {
  const logSheet = getSheetByName(LOG_SHEET_NAME);
  const timestamps = logSheet.getSheetValues(currTopChartRow, 1, logSheet.getMaxRows(), 1);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  startDate.setHours(0, 0, 0);
  const endDate = new Date();

  const matchingTimestamps = filterByDate(timestamps, 0, startDate, endDate);
  const indexOfFirstMatch = ArrayLib.indexOf(timestamps, 0, matchingTimestamps[0][0]);
  return currTopChartRow + indexOfFirstMatch;
}

/**
 * From https://sites.google.com/site/nnillixxsource/Notable/PivotChartsLib/ArrayLib/filterByDate_js
 * Included here because the library version does not check for date instances correctly.
 * Note: This may be an AppsScript/V8 bug and not the fault of the original author.
 */
function filterByDate(data, columnIndex, startDate, endDate) {
    if (data.length > 0) {
        if (typeof columnIndex != "number" || columnIndex > data[0].length) {
            throw "Choose a valide column index";
        }
        if (startDate instanceof Date == false || endDate instanceof Date == false) {
            throw "startDate and endDate must be dates";
        }
        startDate = startDate.getTime();
        endDate = endDate.getTime();
        var r = [];
        for (var i = 0; i < data.length; i++) {
            var date = new Date(data[i][columnIndex]);
            if (data[i][columnIndex] != "" && isNaN(date.getYear())) {
                throw "The selected column should only contain Dates";
            } else {
                if (data[i][columnIndex] != "" && date.getTime() > startDate && date.getTime() < endDate) {
                    r.push(data[i]);
                }
            }
        }
        return r;
    } else {
        return data;
    }
}
