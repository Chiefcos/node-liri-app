// All our modules are loaded here
require("dotenv").config();
var Spotify = require("node-spotify-api");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var axios = require("axios");
var moment = require("moment");
var fs = require("fs");

// some global variables
var spotifyCheck = "spotify-this-song";
var movieCheck = "movie-this";
var bandsInTownCheck = "concert-this";
var fsCheck = "do-what-it-says";

// This is a switchboard for different search engines
// IMDB, Bands in Town, Spotify and a node module to write documents
function searchCheck() {
  var input = process.argv.slice(2);
  var check = input.shift();
  if (check.indexOf(movieCheck) !== -1) {
    imdb(input);
  } else if (check.indexOf(bandsInTownCheck) !== -1) {
    bandsInTown(input);
  } else if (check.indexOf(spotifyCheck) !== -1) {
    spotifySearch(input);
  } else if (check.indexOf(fsCheck) !== -1) {
    fsSearch(input);
  }
}

//  This is the IMDB function that will run a search based on user input
function imdb(input) {
  // We run the API search
  axios
    .get("http://www.omdbapi.com/?t=" + input + "&apikey=trilogy")
    .then(function(response) {
      // We collect the data from the API here
      const {
        Title: title,
        Year: year,
        imdbRating: imdbRating,
        Country: country,
        Language: language,
        Plot: plot,
        Actors: actors
      } = response.data;

      var rottenTomatoes = response.data.Ratings[1].Value;

      // We display the data on the terminal
      console.log("===============================");
      console.log("Movie Title: " + title);
      console.log("Year: " + year);
      console.log("IMDB Rating: " + imdbRating);
      console.log("Rotten Tomatoes: " + rottenTomatoes);
      console.log("Country: " + country);
      console.log("Language: " + language);
      console.log("Plot: " + plot);
      console.log("Actors: " + actors);
      console.log("===============================\n");
    })
    // an error function to catch and display any errors
    .catch(function(error) {
      console.log(error);
    });
}

// This is the Bands in Town function to display user input
function bandsInTown(input) {
  // We run the search on Bands in Town
  axios
    .get(
      "https://rest.bandsintown.com/artists/" +
        input +
        "/events?app_id=codingbootcamp"
    )
    // We retrieve information through a promise method
    .then(function(res) {
      var resLen = res.data.length;
      for (let i = 0; i < resLen; i++) {
        // We capture and format the date and time
        var date = moment(res.data[i].datetime);

        // We display the information on the terminal
        console.log("===============================");
        console.log("Venue: " + res.data[i].venue.name);
        console.log("Location: " + res.data[i].venue.city);
        console.log("Country: " + res.data[i].venue.country);
        console.log("Date: " + date.format("MM,DD,YYYY"));
        console.log("=============================== \n");
      }
    })
    // We catch any errors and display them in the terminal if present
    .catch(function(error) {
      console.log(error);
    });
}

// This is the spotify function which runs a search through spotify on user input
function spotifySearch(input) {
  // We run the spotify search
  spotify.search({ type: "track", query: input }, function(err, data) {
    if (err) {
      return console.log("Error occurred: " + err);
    }
    // We capture the relevant data
    var response = data.tracks.items.length;
    for (let j = 0; j < response; j++) {
      // and display it on the terminal
      console.log("===============================");
      console.log("Title: " + data.tracks.items[j].name);
      console.log("Artist: " + data.tracks.items[j].artists[0].name);
      console.log("Album Name: " + data.tracks.items[j].album.name);
      console.log("=============================== \n");
    }
  });
}
// This function reads and writes to a document
function fsSearch(input) {
  // If there is any user input we initialize the writting function
  writtenResponse(input);
  // We read the document and check which of the functions we should run

  // this is the writting function
  function writtenResponse(input) {
    input = input.join(" ");
    // and writes it to the document
    fs.writeFile("random.txt", input, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }

  // After that we read the document
  fs.readFile("random.txt", "utf8", function(error, data) {
    // We capture any errors and display them
    if (error) {
      return console.log(error);
    }
    if (data.indexOf(spotifyCheck) !== -1) {
      var output = data.slice(spotifyCheck.length);
      output = output.trim();
      spotifySearch(output);
    } else if (data.indexOf(bandsInTownCheck) !== -1) {
      var output = data.slice(bandsInTownCheck.length);
      output = output.trim();
      bandsInTown(output);
    } else if (data.indexOf(movieCheck) !== -1) {
      var output = data.slice(movieCheck.length);
      output = output.trim();
      imdb(output);
    }
  });
}
searchCheck();
