var city = ""
var searchedCity = []
var searchEl = $("#search-button")
var clearEl = $("#clear-history")
var cityEl = $("#city-name")
var windEl = $("#wind-speed")
var uvEl = $("#UV-index")
var cityEnter = $("#enter-city")
var pictureEl = $("#current-picture")
var tempEl = $("#temperature")
var humidityEl = $("#humidity")

var todayEl = document.querySelector(".one-day");
var weekEl = document.querySelector(".five-day");
searchEl.click(weather);

clearEl.click(clearHistory);

function find(city) {
    for (var i = 0; i < searchedCity.length; i++) {
        if (city.toUpperCase() === searchedCity[i]) {
            return -1;
        }
    }
    return 1;
}
function weather(event) {
    event.preventDefault();
    if (cityEnter.val().trim() !== "") {
        city = cityEnter.val().trim();
        currentWeather(city);
        todayEl.classList.remove("d-none");
        weekEl.classList.remove("d-none");
    }
}

function addToHistory(history) {
    var listEl = $("<li>" + history.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", history.toUpperCase());
    $(".list-group").append(listEl);
}


function clearHistory(event) {
    event.preventDefault();
    searchedCity = [];
    localStorage.removeItem("cityEl");
    document.location.reload();
}


function previousSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
        todayEl.classList.remove("d-none");
        weekEl.classList.remove("d-none");
    }
}
$(document).on("click", previousSearch);


function lastSearch() {
    $("ul").empty();
    var searchedCity = JSON.parse(localStorage.getItem("cityEl"));
    if (searchedCity !== null) {
        searchedCity = JSON.parse(localStorage.getItem("cityEl"));
        for (i = 0; i < searchedCity.length; i++) {
            addToHistory(searchedCity[i]);
        }
        city = searchedCity[i - 1];
        currentWeather(city);
        todayEl.classList.remove("d-none");
        weekEl.classList.remove("d-none");
    }
}
$(window).on("load", lastSearch);


function currentWeather(city) {
    console.log(city)
    var apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=37fc43925c5a51f9ab5bea46e987dda6&lang=en";

    fetch(apiURL)
        .then(function (response) {
            response.json()
                .then(function (data) {
                    console.log(data)
        
                    var date = new Date(data.dt * 1000).toLocaleDateString();
                    var weatherPicture = data.weather[0].icon;
                    var iconURL = "https://openweathermap.org/img/wn/" + weatherPicture + "@2x.png";
                    cityEl.html(data.name + "(" + date + ")" + "<img src=" + iconURL + ">");
                    tempEl.html(data.main.temp + "°F");
                    humidityEl.html(data.main.humidity + "%");
                    windEl.html(data.wind.speed + "MPH");
                    UVIndex(data.coord.lon, data.coord.lat);
                    weekElForcast(data.id)
                    if (data.cod == 200) {
                        searchedCity = JSON.parse(localStorage.getItem("cityEl"));
                        console.log(searchedCity);
                        if (searchedCity == null) {
                            searchedCity = [];
                            searchedCity.push(city.toUpperCase());
                            localStorage.setItem("cityEl", JSON.stringify(searchedCity));
                            addToHistory(city);
                        }
                        else {
                            if (find(city) > 0) {
                                searchedCity.push(city.toUpperCase());
                                localStorage.setItem("cityEl", JSON.stringify(searchedCity));
                                addToHistory(city);
                            }
                        }
                    }

                })
        })
}


function UVIndex(latitude, longitude) {
    var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=37fc43925c5a51f9ab5bea46e987dda6&lat=" + latitude + "&lon=" + longitude;

    fetch(uvURL)
        .then(function (response) {
            response.json()
                .then(function (response) {
                    console.log(response);
                    uvEl.html(response.value);

                    var badgeColor = document.querySelector("#UV-index")
              
                if (response.value < 2 ) {
                    badgeColor.classList.add("badge", "bg-success");
                    badgeColor.classList.remove("badge", "bg-warning");
                    badgeColor.classList.remove("badge", "bg-danger");
                }
                else if (response.value > 2 && response.value < 5) {
                    badgeColor.classList.add("badge", "bg-warning");
                    badgeColor.classList.remove("badge", "bg-danger");
                    badgeColor.classList.remove("badge", "bg-success");
                }
                else {
                    badgeColor.classList.add("badge", "bg-danger");
                    badgeColor.classList.remove("badge", "bg-success");
                    badgeColor.classList.remove("badge", "bg-warning");
                }

                })       
        })
}


function weekElForcast(id) {
    var weekElURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + id + "&units=imperial&appid=37fc43925c5a51f9ab5bea46e987dda6&lang=en";

    fetch(weekElURL)
        .then(function (response) {
            response.json()
                .then(function (data) {
                    console.log(data);
                  
                    for (i = 0; i < 5; i++) {
                        var weekDate = new Date((data.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
                        var weekPicture = data.list[((i + 1) * 8) - 1].weather[0].icon;
                        var weekPictureURL = "https://openweathermap.org/img/wn/" + weekPicture + ".png";
                        var weekTemp = data.list[((i + 1) * 8) - 1].main.temp;
                        var weekHumidity = data.list[((i + 1) * 8) - 1].main.humidity;

                        $("#weekDate" + i).html(weekDate);
                        $("#weekPicture" + i).html("<img src=" + weekPictureURL + ">");
                        $("#weekTemp" + i).html(weekTemp + "°F");
                        $("#weekHumidity" + i).html(weekHumidity + "%");
                    }
                })
        })
}