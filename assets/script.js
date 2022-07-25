// api key
var myApi = "fd129fded302bf3c8993158fa8a215cc";

// global variables 
var searchBtn = $('#searchButton');
var clearBtn = $('#clearButton');
var searchHistory = $('#searchHistory');
var cityInput = $('#cityInput');

// function to get weather api and pull info from it 
function gatherWeather(data) {
    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${myApi}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var currentDay = $('#currentDay');
            currentDay.addClass('border border-primary');

            var cityName = $('<h2>');
            cityName.text(currentCity);
            currentDay.append(cityName);

            var currentCityDate = data.current.dt;
            currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");
            var currentDate = $('<span>');
            currentDate.text(` (${currentCityDate}) `);
            cityName.append(currentDate);

            var currentCityWeatherIcon = data.current.weather[0].icon; 
            var currentWeatherIcon = $('<img>');
            currentWeatherIcon.attr("src", "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png");
            cityName.append(currentWeatherIcon);

            var currentCityTemp = data.current.temp;
            var currentTemp = $('<p>')
            currentTemp.text(`Temp: ${currentCityTemp}°F`)
            currentDay.append(currentTemp);
            
            var currentCityWind = data.current.wind_speed;
            var currentWind = $('<p>')
            currentWind.text(`Wind: ${currentCityWind} MPH`)
            currentDay.append(currentWind);

            var currentCityHumidity = data.current.humidity;
            var currentHumidity = $('<p>')
            currentHumidity.text(`Humidity: ${currentCityHumidity}%`)
            currentDay.append(currentHumidity);

            var currentCityUV = data.current.uvi;
            var currentUvEl = $('<p>');
            var currentUvSpanEl = $('<span>');
            currentUvEl.append(currentUvSpanEl);

            currentUvSpanEl.text(`UV: ${currentCityUV}`)
            
            // if statement for color of uv background 
            if ( currentCityUV < 3 ) {
                currentUvSpanEl.css({'background-color':'green', 'color':'white'});
            } else if ( currentCityUV < 6 ) {
                currentUvSpanEl.css({'background-color':'yellow', 'color':'black'});
            } else if ( currentCityUV < 8 ) {
                currentUvSpanEl.css({'background-color':'orange', 'color':'white'});
            } else if ( currentCityUV < 11 ) {
                currentUvSpanEl.css({'background-color':'red', 'color':'white'});
            } else {
                currentUvSpanEl.css({'background-color':'violet', 'color':'white'});
            }

            currentDay.append(currentUvEl);

        //    five day forecast 
            var fiveDayForecastHeaderEl = $('#fiveDayForecastHeader');
            var fiveDayHeaderEl = $('<h2>');
            fiveDayHeaderEl.text('5-Day Forecast:');
            fiveDayForecastHeaderEl.append(fiveDayHeaderEl);

            var fiveDayForecastEl = $('#fiveDayForecast');

            // for loop to pull info for next five days 
            for (var i = 1; i <=5; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;

                date = data.daily[i].dt;
                date = moment.unix(date).format("MM/DD/YYYY");

                temp = data.daily[i].temp.day;
                icon = data.daily[i].weather[0].icon;
                wind = data.daily[i].wind_speed;
                humidity = data.daily[i].humidity;

                var card = document.createElement('div');
                card.classList.add('card', 'col-2', 'm-1', 'bg-primary', 'text-white');
                
                var cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardBody.innerHTML = `<h6>${date}</h6>
                                      <img src= "http://openweathermap.org/img/wn/${icon}.png"> </><br>
                                       ${temp}°F<br>
                                       ${wind} MPH <br>
                                       ${humidity}%`
                
                card.appendChild(cardBody);
                fiveDayForecastEl.append(card);
            }
        })
    return;
}

// display search history based on localStorage 
function displaySearchHistory() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    var searchHistory = document.getElementById('searchHistory');

    searchHistory.innerHTML ='';

    // creates a clickable button for search history 
    for (i = 0; i < storedCities.length; i++) {
        
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-primary", "my-2", "pastCity");
        pastCityBtn.setAttribute("style", "width: 100%");
        pastCityBtn.textContent = `${storedCities[i].city}`;
        searchHistory.appendChild(pastCityBtn);
    }
    return;
}

function getCoordinates () {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${myApi}`;
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

    fetch(requestUrl)
      .then(function (response) {
        // print status error if it isn't in the 200s
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
          } else {
            throw Error(response.statusText);
          }
      })
      .then(function(data) {
 
        var cityInfo = {
            city: currentCity,
            lon: data.coord.lon,
            lat: data.coord.lat
        }

        storedCities.push(cityInfo);
        localStorage.setItem("cities", JSON.stringify(storedCities));

        displaySearchHistory();

        return cityInfo;
      })
      .then(function (data) {
        gatherWeather(data);
      })
      return;
}

// remove items from local storage 
function clearHistory (event) {
    event.preventDefault();
    var searchHistory = document.getElementById('searchHistory');

    localStorage.removeItem("cities");
    searchHistory.innerHTML ='';

    return;
}

// clears the weather from current and five day forecast 
function clearCurrentCityWeather () {
    var currentDay = document.getElementById("currentDay");
    currentDay.innerHTML = '';

    var fiveDayForecastHeaderEl = document.getElementById("fiveDayForecastHeader");
    fiveDayForecastHeaderEl.innerHTML = '';

    var fiveDayForecastEl = document.getElementById("fiveDayForecast");
    fiveDayForecastEl.innerHTML = '';

    return;
}


function cityFormSubmit (event) {
    event.preventDefault();
    currentCity = cityInput.val().trim();

    clearCurrentCityWeather();
    getCoordinates();

    return;
}

function getPastCity (event) {
    var element = event.target;

    if (element.matches(".pastCity")) {
        currentCity = element.textContent;
        
        clearCurrentCityWeather();

        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${myApi}`;
        
        fetch(requestUrl)
          .then(function (response) {
            // if statement that will throw the error status if it isnt in the 200s 
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
              } else {
                throw Error(response.statusText);
              }
           })
           .then(function(data) {
                var cityInfo = {
                    city: currentCity,
                    lon: data.coord.lon,
                    lat: data.coord.lat
                }
                return cityInfo;
            })
           .then(function (data) {
                gatherWeather(data);
        })
    }
    return;
}

displaySearchHistory();

searchBtn.on("click", cityFormSubmit);

clearBtn.on("click", clearHistory);

searchHistory.on("click", getPastCity);
