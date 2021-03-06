/**
 * Use OpenWeatherMap to retrieve local weather information. They're global, and so more accessible
 * for the rest of us than NWS.
 * 
 * This script uses a few global variables:
 * 
 * OWM_API_KEY: Your OWM API key. Set up a free account here: https://openweathermap.org/appid
 * OWM_UNITS: "metric" for Celcius or "imperial" for Fahrenheit (because who uses Kelvin?)
 * OWM_LOCATION_ID: This is more deterministic than querying for your location. To find your city id, 
 *    go to https://openweathermap.org/ and search for your weather. The id will be in the resulting
 *    URL. For example, Halifax, NS, Canada is 6324729. If you can't find a good city, check here for
 *    how to use geographic coordinates: https://openweathermap.org/current#geo
 */
function retrieveWeather() {
    let weatherData = {};
  
    try {
      const url = 'api.openweathermap.org/data/2.5/weather?units=' + OWM_UNITS + '&id=' + OWM_LOCATION_ID + '&appid=' + OWM_API_KEY
      const response = UrlFetchApp.fetch(url);
      weatherData = JSON.parse(response.getContentText());
    }
    catch (e) {
      console.error(e);
      return [];
    }
  
    const weatherArray = [
      `=IMAGE("https://openweathermap.org/img/wn/${weatherData['weather'][0]['icon']}.png")`,
      weatherData['weather'][0]['main'],
      weatherData['weather'][0]['description'],
      weatherData['main']['temp'],
      weatherData['main']['feels_like'],
      weatherData['wind']['deg'],
      weatherData['wind']['speed'],
      weatherData['wind']['gust'],
      weatherData['main']['pressure'],
      weatherData['main']['humidity'],
      weatherData['visibility'],
    ];
  
    return weatherArray;
  }
    