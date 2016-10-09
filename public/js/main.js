var config = {
    apiKey: "AIzaSyCTA7HfjLm1Wv8Np1I4eGmmhCOOrvpKmIU",
    authDomain: "qrator-8ab17.firebaseapp.com",
    databaseURL: "https://qrator-8ab17.firebaseio.com",
    storageBucket: "qrator-8ab17.appspot.com",
    messagingSenderId: "654902851014"
  };
  firebase.initializeApp(config);

var database = firebase.database();

var playlistTable = document.querySelector("#playlists");
var loadingBar = document.querySelector("#loading-bar");
var songTable = document.querySelector("#song-list");
var playlists = document.querySelector("#playlists tbody");
var songList = document.querySelector("#song-list tbody");
var currentPlaylistTitle = document.querySelector("#playlist-title");
var backToPlaylists = document.querySelector("#return-to-playlists");
var addFieldWrapper = document.querySelector("#add-field-wrapper");
var addFieldDialog = document.querySelector('#add-field-dialog');
var addFieldButton = document.querySelector('#add-field-button');
var addNewField = document.querySelector("#add-new-field");
var removeCriteriaButtons = document.querySelectorAll('.remove-criteria');
var editValueButtons = document.querySelectorAll('.criteria-value');
var editValueDialog = document.querySelector('#edit-value-dialog');

function hasClass(el, className) {
  if (el.classList)
	return el.classList.contains(className)
  else
	return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
function addClass(el, className) {
  if (el.classList)
	el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}
function removeClass(el, className) {
  if (el.classList)
	el.classList.remove(className)
  else if (hasClass(el, className)) {
	var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
	el.className=el.className.replace(reg, ' ')
  }
}
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
function isReal(el) {
	if (el != null && el != undefined && el != "") {
		return true;
	} else {
		return false;
	}
}

function reloadRemoveCriteriaButtons() {
	removeCriteriaButtons = document.querySelectorAll('.remove-criteria');
	for (var i = 0; i < removeCriteriaButtons.length; i++) {
		removeCriteriaButtons[i].addEventListener('click', function(){
			addFieldDialog.querySelector('.mdl-grid').removeChild(document.querySelector("#" + this.dataset.closeid));
		});
	}
}

function reloadEditValueButtons() {
	editValueButtons = document.querySelectorAll('.criteria-value');
	for (var i = 0; i < editValueButtons.length; i++) {
		editValueButtons[i].addEventListener('click', function(){
			editValueDialog.showModal();
		});
	}
}

editValueDialog.querySelector('.close').addEventListener('click', function() {
  editValueDialog.close();
});

window.onload = function() {
	var inSongView = false;
	var spotifyApi = new SpotifyWebApi();
	var playlistIds = {};
	var currentPlaylistId;
	var playlistData;

	spotifyApi.setAccessToken(accessToken);
	spotifyApi.getUserPlaylists(username).then(function(data) {
		removeClass(loadingBar, "hidden");
		data.items.forEach(function(playlist){
			var content = document.createElement('tr');
			content.innerHTML = '<td class="mdl-data-table__cell--non-numeric playlist" data-id="' + playlist.id + '">' + playlist.name + '</td>'
			playlists.appendChild(content);
			var playlistLinks = document.querySelectorAll(".playlist");
			playlistIds[playlist.id] = playlist.id;
			for (var i = 0; i < playlistLinks.length; i++) {
				playlistLinks[i].addEventListener("click", function(){
					var playlistid = this.dataset.id;
					currentPlaylistId = playlistid;
					spotifyApi.getPlaylist(username, playlistid).then(function(data) {
						//console.log(data);
						database.ref('/playlists/' + data.id).once('value').then(function(snapshot){
							if (snapshot.val() === null) {
								playlistData = {
									"name": data.name,
									"criteria": {
										"rating": {
								  			"name": "rating",
								  			"maxValue": 5
								  		}
									},
									"songs": {}
								};
							} else {
								playlistData = snapshot.val();
								//console.log(playlistData.criteria)
								Object.keys(playlistData.criteria).forEach(function(key,index) {
									var th = document.createElement('th');
									th.setAttribute('class', 'mdl-data-table__cell--non-numeric mdl-color-text--grey-100');
									th.innerHTML = playlistData.criteria[key].name.capitalizeFirstLetter();
									songTable.querySelector('thead tr').appendChild(th);
									var content = document.createElement('div');
									content.setAttribute('id', 'criteria-row-' + playlistData.criteria[key].name);
									addClass(content, "row");
									content.innerHTML = '<div class="mdl-cell mdl-cell--12-col"><div class="mdl-js-textfield mdl-textfield mdl-textfield--floating-label"><input value="' + playlistData.criteria[key].name + '" class="mdl-textfield__input name" id="criteria-' + playlistData.criteria[key].name + '"><label class=mdl-textfield__label for="criteria-' + playlistData.criteria[key].name + '">Name</label></div><div class="mdl-js-textfield mdl-textfield mdl-textfield--floating-label"><input value="' + playlistData.criteria[key].maxValue + '" class="mdl-textfield__input num" id="criteria-' + playlistData.criteria[key].name + '-maxValue"pattern=-?[0-9]*(\.[0-9]+)?><label class=mdl-textfield__label for="criteria-' + playlistData.criteria[key].name + '-maxValue">Max Value</label><span class=mdl-textfield__error>Input is not a number!</span></div><button data-closeid="criteria-row-' + playlistData.criteria[key].name + '" class="remove-criteria mdl-button mdl-button--colored mdl-button--icon mdl-js-button"type=button><i class=material-icons>clear</i></button></div>';
									addFieldDialog.querySelector('.mdl-grid').appendChild(content);
									var inputs = document.querySelectorAll('[class^=mdl]');
    								[].forEach.call(inputs, inp => componentHandler.upgradeElement(inp));
    								reloadRemoveCriteriaButtons();
								});
							}
							currentPlaylistTitle.innerHTML = data.name;
							var songs = data.tracks.items;
							for (var i = 0; i < songs.length; i++) {
								var song = songs[i];
								if (!isReal(playlistData.songs[song.track.id])) {
									playlistData.songs[song.track.id] = playlistData.criteria;
									//playlistData.songs[song.track.id].rating.value = 0;
								}
								var content = document.createElement('tr');
								content.innerHTML = '<td class="mdl-data-table__cell--non-numeric">' + song.track.name + '</td><td class="mdl-data-table__cell--non-numeric">'+ song.track.artists[0].name + '</td><td class="mdl-data-table__cell--non-numeric">' + song.track.album.name + '</td>'
								Object.keys(playlistData.criteria).forEach(function(key,index) {
									content.innerHTML += '<td class="criteria-value" data-songid="' + song.track.id + '" data-criteriaName="' + key + '">' + playlistData.songs[song.track.id][key].value + '</td>';
								});
								songList.appendChild(content);
								var inputs = document.querySelectorAll('[class^=mdl]');
								[].forEach.call(inputs, inp => componentHandler.upgradeElement(inp));
								reloadRemoveCriteriaButtons();
								reloadEditValueButtons()
								$(function(){
								  $("#song-list").tablesorter({'sortReset': true});
								});
							}
							addClass(playlistTable, "hidden");
							removeClass(songTable, "hidden");
							removeClass(backToPlaylists, "hidden");
							removeClass(addFieldWrapper, "hidden");
							inSongView = true;
							database.ref('/playlists/' + data.id).set(playlistData, function(err){
								if (err) {
									console.error(err);
								}
							});
						});
					}, function(err) {
						console.error(err);
					});
				});
			}
			addClass(loadingBar, "hidden");
		});
		//console.log(playlistIds)
		database.ref('/users/' + userdata.id + '/playlists/').set(playlistIds, function(err){
			if (err) {
				console.error(err);
			}
		});
	}, function(err) {
		console.error(err);
	});

	backToPlaylists.addEventListener('click', function() {
		if (inSongView) {
			songList.innerHTML = "";
			currentPlaylistTitle.innerHTML = "Playlists";
			removeClass(playlistTable, "hidden");
			addClass(songTable, "hidden");
			addClass(backToPlaylists, "hidden");
			addClass(addFieldWrapper, "hidden");
			inSongView = false;
		}
	});

	var count = 0;
	addNewField.addEventListener('click', function(){
		count += 1;
		var content = document.createElement('div');
		content.setAttribute('id', 'criteria-row-new-' + count);
		addClass(content, "row");
		content.innerHTML = '<div class="mdl-cell mdl-cell--12-col"><div class="mdl-js-textfield mdl-textfield mdl-textfield--floating-label"><input class="mdl-textfield__input name" id="criteria-new-' + count + '"><label class=mdl-textfield__label for="criteria-new-' + count + '">Name</label></div><div class="mdl-js-textfield mdl-textfield mdl-textfield--floating-label"><input class="mdl-textfield__input num" id="criteria-new-' + count + '-maxValue"pattern=-?[0-9]*(\.[0-9]+)?><label class=mdl-textfield__label for="criteria-new-' + count + '-maxValue">Max Value</label><span class=mdl-textfield__error>Input is not a number!</span></div><button data-closeid="criteria-row-new-' + count + '" class="remove-criteria mdl-button mdl-button--colored mdl-button--icon mdl-js-button"type=button><i class=material-icons>clear</i></button></div>';
		addFieldDialog.querySelector('.mdl-grid').appendChild(content);
		var inputs = document.querySelectorAll('[class^=mdl]');
		[].forEach.call(inputs, inp => componentHandler.upgradeElement(inp));
		reloadRemoveCriteriaButtons();
	});

    addFieldButton.addEventListener('click', function() {
      addFieldDialog.showModal();
    });
    addFieldDialog.querySelector('.close').addEventListener('click', function() {
      addFieldDialog.close();
    });
    addFieldDialog.querySelector('.save').addEventListener('click', function() {
    	var rows = addFieldDialog.querySelectorAll('.mdl-grid .row');
    	var nameVal, maxValueVal;
    	playlistData.criteria = {};
    	for (var i = 0; i < rows.length; i++) {
    		nameVal = rows[i].querySelector(".mdl-textfield__input.name").value;
    		maxValueVal = rows[i].querySelector(".mdl-textfield__input.num").value;
    		playlistData.criteria[nameVal] = {
    			"name": nameVal,
    			"maxValue": maxValueVal
    		}
    	}
    	Object.keys(playlistData.songs).forEach(function(key,index) {
    		playlistData.songs[key][nameVal] = {
    			"name": nameVal,
    			"maxValue": maxValueVal,
    			"value": 0
    		}
    	});
    	database.ref('/playlists/' + currentPlaylistId).set(playlistData, function(err){
    		addFieldDialog.close();
			if (err) {
				console.error(err);
			}
		});
    });
}