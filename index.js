document.addEventListener("DOMContentLoaded", function () {
    const getWeatherBtn = document.getElementById("getWeatherBtn");

    getWeatherBtn.addEventListener("click", function () {
        let city = document.getElementById("city").value.trim();
        if (!city) {
            alert("Please enter a city name.");
            return;
        }

        fetchWeatherData(city);
    });
});

async function fetchWeatherData(city) {
    try {
        // Convert city name to latitude & longitude using Open-Meteo Geocoding API
        let geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        if (!geoResponse.ok) throw new Error("Failed to fetch location data.");

        let geoData = await geoResponse.json();
        if (!geoData.results) {
            document.getElementById("weatherInfo").style.display = "none";
            throw new Error("City not found. Please try another city.");
        }


        // Extract latitude and longitude from API response
        let lat = geoData.results[0].latitude;
        let lon = geoData.results[0].longitude;

        //  Fetch weather data from Open-Meteo API
        let weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&temperature_unit=fahrenheit&timezone=auto`);
        if (!weatherResponse.ok) throw new Error("Failed to fetch weather data.");

        let weatherData = await weatherResponse.json();
        updateUI(weatherData); // Update the UI with fetched weather data
        
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("temperature").innerHTML = "Error: " + error.message;
        document.getElementById("humidity").innerHTML = "";
        document.getElementById("condition-icon").innerHTML = "";
    }
}

function updateUI(weatherData) {
    let temp = weatherData.current.temperature_2m;
    let humidity = weatherData.current.relative_humidity_2m;
    let precipitation = weatherData.current.precipitation;
    let weatherInfo = document.getElementById("weatherInfo");

    document.getElementById("temperature").innerHTML = `🌡 Temperature: ${temp}°F`;
    document.getElementById("humidity").innerHTML = `💧 Humidity: ${humidity}%`;

    // Update weather icon
    let conditionIcon = document.getElementById("condition-icon");
    if (precipitation > 0) {
        conditionIcon.innerHTML = `<i class="bi bi-cloud-rain" style="font-size:50px; color:blue;"></i>`; // Rainy
    } else if (temp > 80) {
        conditionIcon.innerHTML = `<i class="bi bi-brightness-high" style="font-size:50px; color:gold;"></i>`; // Sunny
    } else if (temp > 60) {
        conditionIcon.innerHTML = `<i class="bi bi-cloud-sun" style="font-size:50px; color:orange;"></i>`; // Partly Cloudy
    } else {
        conditionIcon.innerHTML = `<i class="bi bi-cloud" style="font-size:50px; color:gray;"></i>`; // Cloudy
    }

    weatherInfo.style.display = "block";
}
