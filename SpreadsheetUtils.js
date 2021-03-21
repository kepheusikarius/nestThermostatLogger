function getSheetByName(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(sheetName);
}
  
function getCell(sheetName, cellAddress) {
  const chartDataSheet = getSheetByName(sheetName);
  chartDataSheet.setCurrentCell(chartDataSheet.getRange(cellAddress))
  return chartDataSheet.getCurrentCell();
}
