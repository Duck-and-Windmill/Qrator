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

window.onload = function() {
	var playlistTable = document.querySelector("#playlists");
	var songTable = document.querySelector("#song-list");
	var playlists = document.querySelector("#playlists tbody");
	var songList = document.querySelector("#song-list tbody");
	var currentPlaylistTitle = document.querySelector("#playlist-title");
	var backToPlaylists = document.querySelector("#return-to-playlists");
	var addFieldWrapper = document.querySelector("#add-field-wrapper");
	var spotifyApi = new SpotifyWebApi();
	var playlistids = {};
	spotifyApi.setAccessToken(accessToken);
	spotifyApi.getUserPlaylists(username).then(function(data) {
		data.items.forEach(function(playlist){
			var content = document.createElement('tr');
			content.innerHTML = '<td class="mdl-data-table__cell--non-numeric playlist" data-id="' + playlist.id + '">' + playlist.name + '</td>'
			playlists.appendChild(content);
			playlistids[playlist.name] = playlist.id;
			var playlistLinks = document.querySelectorAll(".playlist");
			for (var i = 0; i < playlistLinks.length; i++) {
				playlistLinks[i].addEventListener("click", function(){
					var playlistid = this.dataset.id;
					spotifyApi.getPlaylist(username, playlistid).then(function(data) {
						console.log(data);
						currentPlaylistTitle.innerHTML = data.name;
						var songs = data.tracks.items;
						for (var i = 0; i < songs.length; i++) {
							var song = songs[i];
							var content = document.createElement('tr');
							content.innerHTML = '<td class="mdl-data-table__cell--non-numeric">' + song.track.name + '</td><td class="mdl-data-table__cell--non-numeric">'+ song.track.artists[0].name + '</td><td class="mdl-data-table__cell--non-numeric">' + song.track.album.name + '</td>'
							songList.appendChild(content);
						}
						addClass(playlistTable, "hidden");
						removeClass(songTable, "hidden");
						removeClass(backToPlaylists, "hidden");
						removeClass(addFieldWrapper, "hidden");
					}, function(err) {
						console.error(err);
					});
				});
			}
		});
	}, function(err) {
		console.error(err);
	});
}