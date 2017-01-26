var config = {
  defaultCity: "Gdynia",
  mapZoom: 8,
  errorsDisplayTime: 7000,
  validationDisplayTime: 1000,
  baseUrl: 'https://api.apixu.com'
};

var $search = $("#search"),
  $searchedCity = $("#searched-city"),
  $city = $("#city"),
  $precipitation = $("#precipitation"),
  $temperature = $("#temperature"),
  $temperatureFeelslike = $("#temperature-feelslike"),
  $pressure = $("#pressure"),
  $windVelocity = $("#wind-velocity"),
  $windDirection = $("#wind-direction"),
  $humidity = $("#humidity"),
  $weatherIcon = $("#weather-icon"),
  $text = $("#weather-status"),
  $searchBtn = $("#search-btn"),
  $map = $("#map")[0],
  $errorParagraph = $(".error-message"),
  $errmsg = $("#errmsg"),
  $weatherContainer = $("#weather-data-container"),
  API_KEY = "5029d657e4fb435686b105052160711",
  errors = {
    ERROR_400: {
      statusText: 'Internal application error. Contact the provider.'
    },
    ERROR_401: {
      statusText: 'You are unauthorised.'
    },
    ERROR_404: {
      statusText: 'Page not found.'
    },
    ERROR_503: {
      statusText: 'Internal server error. Please try again in a few minutes'
    }
  };


function validateCityInput(e) {
  var letters = /^[A-Za-z]+$/;
  if (!e['key'].match(letters)) {
    $errmsg.html("Only letters allowed").show().fadeOut(config.validationDisplayTime);
    return false;
  }
}

function fetchData(query) {
  return $.ajax({
    url: config.baseUrl + "/v1/current.json?key=" + API_KEY + "&q=" + query,
    type: "GET"
  });
}

function setBackground(isDay) {
  $weatherContainer.css("background-color", isDay ? "#5bc0de" : "#00008b");
}

function initMap(lat, lng) {
  var location = {
    lat: lat,
    lng: lng
  };
  var map = new google.maps.Map($map, {
    zoom: config.mapZoom,
    center: location
  });
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
}

function handleError(error) {
  var errorMessage = errors["ERROR_" + error.status];
  $errorParagraph.html(errorMessage.statusText);
  setTimeout(function () {
    $errorParagraph.hide();
  }, config.errorsDisplayTime);
}

function displayWeatherData(response) {
  $searchedCity.html(response.location.country);
  $city.html(response.location.name);
  $precipitation.html(response.current.precip_mm);
  $temperature.html(response.current.temp_c);
  $temperatureFeelslike.html(response.current.feelslike_c);
  $pressure.html(response.current.pressure_mb);
  $windVelocity.html(response.current.wind_kph);
  $windDirection.html(response.current.wind_dir);
  $humidity.html(response.current.humidity);
  $weatherIcon.html($('<img src="' + response.current.condition.icon + '">').addClass('weather-icon'));
  $text.html(response.current.condition.text);
  initMap(response.location.lat, response.location.lon);
  setBackground(response.current.is_day);
}

function handleWeatherData(query) {
  fetchData(query).then(function (response) {
    if (response.error !== undefined) {
      $errorParagraph.html(response.error.message);
      return;
    }

    $errorParagraph.empty();
    displayWeatherData(response);
  }).fail(handleError);
}

function searchByCity() {
  handleWeatherData($search.val());
}

function enableSearchButton() {
  $search.val() === '' ?  $searchBtn.attr("disabled", true) :
    $searchBtn.attr("disabled", false)
}


$search.on("keyup", enableSearchButton);
$search.on("keypress", validateCityInput);
$searchBtn.on("click", searchByCity);
handleWeatherData(config.defaultCity);
initMap();


