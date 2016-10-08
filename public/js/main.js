window.onload = function() {
	var playlists = document.querySelector("#playlists tbody");
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