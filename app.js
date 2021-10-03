// Client ID: wko4e3cmseckviqu3zbu4qz46iqtvg
// Client Secret: 0uiuthefr0i36fpuk3ox1ems06grmv
// Access Token (Authorization): aq60uyuzrq19ysa0kta4y1szvk63lr

/**
 * xhr: HTTPRequest object.
 * url: Base url to search for the game.
 * currentPage: Page of streams the user is currently looking at.
 * numOfPages: Number of pages the user can look through once they search for a game.
 * currentStreams: Nested array to split streams into their respective pages.
 */
var xhr = new XMLHttpRequest();
const url = "https://api.twitch.tv/helix/games/?name=";
var currentPage = 1;
let numOfPages = 0;
var currentStreams = [];

/**
 * Event listener waiting for the user to click the left triangle to change pages.
 */
document.getElementById('left-triangle').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        document.getElementById('current-page').innerText = currentPage + "/" + Math.ceil(numOfPages);
        displayStreams();
    }
});

/**
 * Event listener waiting for the user to click the right triangle to change pages.
 */
document.getElementById('right-triangle').addEventListener('click', function() {
    if (currentPage < numOfPages) {
        currentPage++;
        document.getElementById('current-page').innerText = currentPage + "/" + Math.ceil(numOfPages);
        displayStreams();
    }
});

/**
 * Event listener waiting for the user type a search query. The submit button will remain disabled until 
 * the user enters a search query.
 */
document.getElementById('search').addEventListener('keyup', function() {
    var text = document.getElementById('search').value;
    if (text != "") {
        document.getElementById("submit-button").removeAttribute("disabled");
    } else {
        document.getElementById("submit-button").setAttribute("disabled", null);
    }
});

/**
 * Event listener waiting for the user to click submit or enter to send their search query.
 */
document.getElementById('submit-button').addEventListener('click', function() {submitSearch()});
document.getElementById('search').addEventListener('keyup', function(e) {
    if (e.keyCode === 13) {
        submitSearch();
    }
});

/**
 * Displays the current five streams based on the page the user is on.
 */
function displayStreams() {
    document.getElementById('stream').innerHTML = '';
    for (var i = 0; i < currentStreams[currentPage - 1].length; i++) {
        document.getElementById('stream').innerHTML += currentStreams[currentPage - 1][i];
    }
}

/**
 * Combines the text from the users search query with the base URL to use to call the API.
 */
function submitSearch() {
    document.getElementById('stream').innerHTML = '';
    document.getElementById('current-page').innerHTML = '0';
    currentPage = 1;
    var search = document.getElementById('search').value;
    let gameURL = url.concat(search);
    findGameID(gameURL);
}

/**
 * Calls the API to get the ID of the game being searched for to utlize later for retrieving the streams.
 * If there is no game found for the search query, a three second alert will appear informing the user that 
 * there are no games with that name and to try again.
 * @param {*} gameUrl The API URL used to find the game ID.
 */
async function findGameID(gameUrl) {
    let response = await new Promise(resolve => {
        xhr.open("GET", gameUrl, true);
        xhr.setRequestHeader('Client-ID', 'wko4e3cmseckviqu3zbu4qz46iqtvg');
        xhr.setRequestHeader('Authorization', 'Bearer aq60uyuzrq19ysa0kta4y1szvk63lr');
        xhr.onload = function() {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            }
        };
        xhr.onerror = function() {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    }) 
    var data = JSON.parse(response);
    if (data['data'].length != 0) {
        findStreams(data['data'][0]['id']);
    } else {
        document.getElementById('count').innerText = 'Total results: 0';
        document.getElementById('alert').style.display = "flex";
        document.getElementById('main-search').style.height = "100px";
        setTimeout(function() {
            document.getElementById('alert').style.display = "none";
            document.getElementById('main-search').style.height = "40px";
        }, 3000);
    }
 };

 /**
  * Calls the API to get all of the streams with a specific game ID.
  * This function is updating the total number of results, the number of pages and current streams.
  * @param {*} response The game ID returned from the first call to the API.
  * @returns NA
  */
function findStreams(response) {
    let baseStreamURL = "https://api.twitch.tv/helix/streams/?game_id=";
    let streamURL = baseStreamURL.concat(response);
    return new Promise(function (resolve, reject) {
        xhr.open('GET', streamURL, true);
        xhr.setRequestHeader('Client-ID', 'wko4e3cmseckviqu3zbu4qz46iqtvg');
        xhr.setRequestHeader('Authorization', 'Bearer aq60uyuzrq19ysa0kta4y1szvk63lr');
        xhr.onload = function() {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                    var data = JSON.parse(xhr.response);
                    let totalResults = 'Total results: ' + data['data'].length.toString();
                    numOfPages = data['data'].length / 5;
                    document.getElementById('count').innerText = totalResults;
                    document.getElementById('current-page').innerText = currentPage + "/" + Math.ceil(numOfPages);
                    currentStreams = [];
                    let count = 0;
                    var arr = [];
                    for (var i = 0; i < data['data'].length; i++) {
                        let twitchURL = "https://www.twitch.tv/";
                        let streamLink = twitchURL.concat(data['data'][i]['user_name']);
                        let thumbnail = data['data'][i]['thumbnail_url'];
                        let t1 = thumbnail.replace("{width}", "250");
                        let t2 = t1.replace("{height}", "150");
                        let text = '<div class="stream-content">' + '<img class="preview-image" src="' + t2 + '">' 
                        + '<div class="text"><div class="display-name"><a href="' + streamLink + '">' + data['data'][i]['user_name'] + '</a></div>' 
                        + '<div class="game-and-views">' + data['data'][i]['game_name'] + ' - ' + data['data'][i]['viewer_count'] + ' viewers</div>' 
                        + '<div class="description"> Stream Description: ' + data['data'][i]['title'] + '</div>' + '</div>' + '</div>';
                        if (count < 5) {
                            arr.push(text);
                            count++;
                        }
                        if ((i == data['data'].length - 1) || (count == 5)) {
                            currentStreams.push(arr);
                            arr = [];
                            count = 0;
                        }
                    }
                    displayStreams();
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            }
        };
        xhr.onerror = function() {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}
