/**
 * Custom menu to use tool from Sheet UI
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('Smart Device Tool')
    .addItem('Authorize access', 'showAuthorizationSidebar')
    .addSeparator()
    .addItem('List devices', 'listDevices')
    .addItem('Log thermostat data','logThermostatDataAllDevices')
    .addToUi();
}
