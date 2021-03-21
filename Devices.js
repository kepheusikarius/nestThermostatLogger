/**
 * list devices to get thermostat IDs
 */
 function listDevices() { 
  // get the device data
  const deviceArray = getDevices().map(device => [
    device.name, 
    device.type, 
    device.traits["sdm.devices.traits.Settings"].temperatureScale,
    device.parentRelations[0].displayName
  ]);

  // prep a new sheet or reset the existing one
  var sheet = getSheetByName(DEVICE_SHEET_NAME);
  if (sheet == null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(DEVICE_SHEET_NAME);
    const deviceSheetHeaders = ["ID", "Type", "Temp Scale", "Location"];
    sheet.getRange(1, 1, 1, 4)
         .setValues([deviceSheetHeaders]);
  } else {
    sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns())
         .clearContent();
  }

  // output the data
  sheet.getRange(2, 1, deviceArray.length, 4)
       .setValues(deviceArray);
}

/**
 * function to make request to google smart api
 */
function makeRequest(endpoint) {
  const smartService = getSmartService();
  const access_token = smartService.getAccessToken();
  const url = `https://smartdevicemanagement.googleapis.com/v1${endpoint}`;

  // setup the headers for the call
  const headers = {
    'Authorization': 'Bearer ' + access_token,
    'Content-Type': 'application/json'
  }
  
  // set up params
  const params = {
    'headers': headers,
    'method': 'get',
    'muteHttpExceptions': true
  }
  
  // try calling API
  const response = UrlFetchApp.fetch(url, params);
  const statusCode = response.getResponseCode();
  const responseBody = JSON.parse(response.getContentText());

  if (statusCode != 200) {
    throw responseBody.error.message;
  }
  
  return responseBody;
}

function getDevices() {
  return makeRequest('/enterprises/' + PROJECT_ID + '/devices').devices;
}

/**
 * function to make request to google smart api
 */
function logThermostatDataAllDevices() {
  let dataArray = [];
  const weatherDataArray = retrieveWeather();
  const devices = getDevices();
  const now = new Date();

  devices.forEach(device => {
    if (device['type'] === 'sdm.devices.types.THERMOSTAT') {
      dataArray.push([now, ...getThermostatData(device), ...weatherDataArray]);
    }
  });

  const sheet = getSheetByName(LOG_SHEET_NAME);
  sheet.getRange(sheet.getLastRow()+1,1,dataArray.length,dataArray[0].length).setValues(dataArray);
}

function getThermostatData(device) {
  const humidity = device.traits['sdm.devices.traits.Humidity']['ambientHumidityPercent'];
  const connectivity = device.traits['sdm.devices.traits.Connectivity']['status'];
  const fan = device.traits['sdm.devices.traits.Fan']['timerMode'];
  const mode = device.traits['sdm.devices.traits.ThermostatMode']['mode'];
  const thermostatEcoMode = device.traits['sdm.devices.traits.ThermostatEco']['mode'];
  const thermostatEcoHeatCelcius = device.traits['sdm.devices.traits.ThermostatEco']['heatCelsius'];
  const thermostatEcoCoolCelcius = device.traits['sdm.devices.traits.ThermostatEco']['coolCelsius'];
  const thermostatHvac = device.traits['sdm.devices.traits.ThermostatHvac']['status'];
  const tempCelcius = device.traits['sdm.devices.traits.Temperature']['ambientTemperatureCelsius'];
  const targetHeatCelcius = device.traits['sdm.devices.traits.ThermostatTemperatureSetpoint']['heatCelsius'];
  const targetCoolCelcius = device.traits['sdm.devices.traits.ThermostatTemperatureSetpoint']['coolCelsius'];

  return [
      getDeviceLocation(device['name']),
      humidity,
      connectivity,
      fan,
      mode,
      thermostatEcoMode,
      thermostatEcoHeatCelcius,
      thermostatEcoCoolCelcius,
      thermostatHvac,
      tempCelcius,
      targetHeatCelcius,
      targetCoolCelcius,
  ];
}

function getDeviceLocation(deviceName) {
  const sheet = getSheetByName(DEVICE_SHEET_NAME);
  const deviceNameLocation = sheet.createTextFinder(deviceName).findNext();
  if (!deviceNameLocation) {
    return 'Unknown';
  }

  const deviceLocationLocation = sheet.getRange(deviceNameLocation.getRow(), 4);
  return deviceLocationLocation.getValue();
}
