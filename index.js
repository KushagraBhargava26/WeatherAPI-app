import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.html");
});

app.post("/weather", async (req, res) => {
  const city = req.body.city;
  const geoCoordinates = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
  try {
    const geoResponse = await axios.get(geoCoordinates);
    const result = geoResponse.data.results;
    if (!result || result.length == 0) {
      throw new Error("City Not Found");
    }
    const { latitude, longitude, name } = result[0];
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature,windspeed,apparent_temperature,weather_code&daily=sunrise,sunset&timezone=auto`;

    const weatherResponse = await axios.get(weatherURL);
    const { temperature, windspeed, apparent_temperature, weather_code } = weatherResponse.data.current;
    const { sunrise, sunset } = weatherResponse.data.daily;
    const { condition, icon } = weatherCode(weather_code);
    res.render("index.ejs", {
      weather: {
        city: name,
        temperature: temperature,
        feelLike: apparent_temperature,
        windspeed: windspeed,
        sunrise: sunrise[0],
        sunset: sunset[0],
        condition: condition,
        icon: icon,
      },
    });
  } catch (error) {
    res.send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function weatherCode(code) {
  switch (code) {
    case 0:
      return { condition: "Clear sky", icon: "☀️" };

    case 1:
      return { condition: "Mainly clear", icon: "🌤️" };
    case 2:
      return { condition: "Partly cloudy", icon: "⛅" };
    case 3:
      return { condition: "Overcast", icon: "☁️" };

    case 45:
    case 48:
      return { condition: "Fog", icon: "🌫️" };

    case 51:
    case 53:
    case 55:
      return { condition: "Drizzle", icon: "🌦️" };

    case 56:
    case 57:
      return { condition: "Freezing Drizzle", icon: "🥶" };

    case 61:
    case 63:
    case 65:
      return { condition: "Rain", icon: "🌧️" };

    case 66:
    case 67:
      return { condition: "Freezing Rain", icon: "❄️🌧️" };

    case 71:
    case 73:
    case 75:
      return { condition: "Snow fall", icon: "❄️" };

    case 77:
      return { condition: "Snow grains", icon: "🌨️" };

    case 80:
    case 81:
    case 82:
      return { condition: "Rain showers", icon: "☔" };

    case 85:
    case 86:
      return { condition: "Snow showers", icon: "🌨️" };

    case 95:
      return { condition: "Thunderstorm", icon: "🌩️" };

    case 96:
    case 99:
      return { condition: "Thunderstorm with hail", icon: "⛈️" };

    default:
      return { condition: "Unknown", icon: "🤷" };
  }
}
