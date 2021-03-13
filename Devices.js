/**
 * list devices to get thermostat IDs
 */
 function listDevices() { 
  // get the device data
  const data = makeRequest('/enterprises/' + PROJECT_ID + '/devices');
  const deviceArray = data.devices.map(device => [
    device.name, 
    device.type, 
    device.traits["sdm.devices.traits.Settings"].temperatureScale
  ]);

  // prep a new sheet or reset the existing one
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DEVICE_SHEET_NAME);
  if (sheet == null) {
    sheet = ss.insertSheet(DEVICE_SHEET_NAME);
    sheet.getRange(1,1,1,4).setValues([["ID", "Type", "Temp Scale", "Location"]]);
  } else {
    sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()).clearContent();
  }

  // output the data
  sheet.getRange(2,1,deviceArray.length,3).setValues(deviceArray);
}

/**
 * function to make request to google smart api
 */
function makeRequest(endpoint) {

  // get the smart service
  const smartService = getSmartService();
  
  // get the access token
  const access_token = smartService.getAccessToken();

  // setup the SMD API url
  const url = 'https://smartdevicemanagement.googleapis.com/v1';

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
  const response = UrlFetchApp.fetch(url + endpoint, params);
  const statusCode = response.getResponseCode();
  const responseBody = JSON.parse(response.getContentText());

  if (statusCode != 200) {
    throw responseBody['error']['message'];
  }
  
  return responseBody;
}

/**
 * function to make request to google smart api
 */
function logThermostatDataAllDevices() {
  const smartService = getSmartService();
  const access_token = smartService.getAccessToken();

  const url = 'https://smartdevicemanagement.googleapis.com/v1';
  const endpoint = '/enterprises/' + PROJECT_ID + '/devices';

  const headers = {
    'Authorization': 'Bearer ' + access_token,
    'Content-Type': 'application/json'
  }
  
  const params = {
    'headers': headers,
    'method': 'get',
    'muteHttpExceptions': true
  }

  let dataArray = [];
  const weatherDataArray = retrieveWeather();

  const response = UrlFetchApp.fetch(url + endpoint, params);
  if (response.getResponseCode() !== 200){
      console.error(`${response.getResponseCode()}: ${response.getContentText()}`);
      return;
  }

  const responseBody = JSON.parse(response.getContentText());
  const devices = responseBody['devices'];
  const now = new Date();

  devices.forEach(device => {
    if (device['type'] === 'sdm.devices.types.THERMOSTAT') {

      const humidity = device['traits']['sdm.devices.traits.Humidity']['ambientHumidityPercent'];
      const connectivity = device['traits']['sdm.devices.traits.Connectivity']['status'];
      const fan = device['traits']['sdm.devices.traits.Fan']['timerMode'];
      const mode = device['traits']['sdm.devices.traits.ThermostatMode']['mode'];
      const thermostatEcoMode = device['traits']['sdm.devices.traits.ThermostatEco']['mode'];
      const thermostatEcoHeatCelcius = device['traits']['sdm.devices.traits.ThermostatEco']['heatCelsius'];
      const thermostatEcoCoolCelcius = device['traits']['sdm.devices.traits.ThermostatEco']['coolCelsius'];
      const thermostatHvac = device['traits']['sdm.devices.traits.ThermostatHvac']['status'];
      const tempCelcius = device['traits']['sdm.devices.traits.Temperature']['ambientTemperatureCelsius'];
      const targetHeatCelcius = device['traits']['sdm.devices.traits.ThermostatTemperatureSetpoint']['heatCelsius'];
      const targetCoolCelcius = device['traits']['sdm.devices.traits.ThermostatTemperatureSetpoint']['coolCelsius'];

      dataArray.push(
        [
          now,
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
        ].concat(weatherDataArray)
      );
      
    }

  });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(LOG_SHEET_NAME);
  sheet.getRange(sheet.getLastRow()+1,1,dataArray.length,dataArray[0].length).setValues(dataArray);
}

function getDeviceLocation(deviceName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DEVICE_SHEET_NAME);

  const deviceNameLocation = sheet.createTextFinder(deviceName).findNext();
  if (!deviceNameLocation) {
    return 'Unknown';
  }

  const deviceLocationLocation = sheet.getRange(deviceNameLocation.getRow(), 4);
  return deviceLocationLocation.getValue();
}
