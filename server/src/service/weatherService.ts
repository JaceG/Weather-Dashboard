import dotenv from 'dotenv';
dotenv.config();
import dayjs from 'dayjs';

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  temperature: number;
  wind: number;
  humidity: number;
  constructor(city: string, date: string, icon: string, temperature: number, wind: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.temperature = temperature;
    this.wind = wind;
    this.humidity = humidity;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private cityName = "";

  constructor() {
    this.baseURL = process.env.API_BASE_URL || "";
    this.apiKey = process.env.API_KEY || "";

    // Check if the API key and base URL are present
    if (!this.apiKey) {
      throw new Error("API key is missing");
    }
    if (!this.baseURL) {
      throw new Error("Base URL is missing");
    }
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.statusText}`);
      }
      const locationData = await response.json();
      return locationData;
    } catch (err) {
      console.error("Error in fetchLocationData:", err);
      throw err;
    }
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { lat, lon } = locationData;
    return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    if (!this.cityName || !this.apiKey) {
      throw new Error("City name or API key is missing");
    }

    const geoCodeQuery = `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(this.cityName)}&appid=${this.apiKey}`;
    return geoCodeQuery;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    const weatherQuery = `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
    return weatherQuery;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const geoCodeQuery = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(geoCodeQuery);

    // Check if locationData exists and is an array
    if (!locationData || !Array.isArray(locationData) || locationData.length === 0) {
      throw new Error("No location data found");
    }

    const coordinates = this.destructureLocationData(locationData[0]);
    return coordinates;
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    try {
      const response = await fetch(weatherQuery);
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.statusText}`);
      }

      const weatherData = await response.json();
      console.log(weatherData);

      const currentWeather = this.parseCurrentWeather(weatherData.list[0]);
      const forecast = this.buildForecastArray(currentWeather, weatherData.list);

      console.log(forecast);
      return forecast;
    } catch (err) {
      console.error("Error in fetchWeatherData:", err);
      throw err;
    }
  }

  // TODO: Build parseCurrentWeather method
private parseCurrentWeather(response: any) {
  const date = dayjs.unix(response.dt).format('MM/DD/YYYY');
  
  let icon = response.weather[0].icon;
  if (icon.endsWith('n')) {
    icon = icon.replace('n', 'd');
  }

  const temperature = response.main.temp;
  const wind = response.wind.speed;
  const humidity = response.main.humidity;

  const currentWeather = new Weather(this.cityName, date, icon, temperature, wind, humidity);
  return currentWeather;
}


  // TODO: Complete buildForecastArray method
private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
  const forecast = [currentWeather];
  
  const filteredWeatherData = weatherData.filter((data: any) => {
    return data.dt_txt.includes('12:00:00');
  });

  for (const day of filteredWeatherData) {
    const date = dayjs.unix(day.dt).format('MM/DD/YYYY');
    
    let icon = day.weather[0].icon;
    if (icon.endsWith('n')) {
      icon = icon.replace('n', 'd');
    }

    const temperature = day.main.temp;
    const wind = day.wind.speed;
    const humidity = day.main.humidity;
    const weather = new Weather(this.cityName, date, icon, temperature, wind, humidity);

    forecast.push(weather);
  }

  return forecast;
}


  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      this.cityName = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      if (coordinates) {
        const weather = await this.fetchWeatherData(coordinates);
        console.log(weather);
        return weather;
      }
      throw new Error('No coordinates found');
    } catch (err) {
      console.error("Error in getWeatherForCity:", err);
      throw err;
    }
  }
}

export default new WeatherService();
