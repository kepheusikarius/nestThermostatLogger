function updateChartDataRange() {
    const sheet = getSheetByName(CHART_DATA_SHEET_NAME);
    sheet.setCurrentCell(sheet.getRange("A2"))
    const cell = sheet.getCurrentCell()
    const currFormula = cell.getFormula();
  
    const currTopCellFinder = /thermostatLogs!A(\d+):/;
    const currTopCell = currFormula.match(currTopCellFinder);
    const newTopCell = parseInt(currTopCell[1], 10) + 144;
    
    const newFormula = `=QUERY(thermostatLogs!A${newTopCell}:AB1000001, "SELECT A,C,J,K,O,Q,R,W,L,M WHERE B = 'Living Room'")`;
  
    cell.setFormula(newFormula);
  }
  