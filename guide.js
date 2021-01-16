$().ready(function() {

	var today = new Date().toISOString().slice(0, 10);
	// var d = new Date();
	// var yesterday = d.setDate(d.getDate() - 1);

	var broadcastChannel = {
		20875: {name: 'DR1', url: 'https://www.dr.dk/drtv'},
		20876: {name: 'DR2', url: 'https://www.dr.dk/drtv'}
	};
	var channelQuery = {
		channels: '20875,20876',
		date: today,
		device: 'web_browser',
		duration: 24,
		hour: 0,
		ff: 'idp,ldp,rpt',
		geoLocation: 'dk',
		isDeviceAbroad: 'false',
		lang: 'da',
		segments: 'drtv,optedout',
		sub: 'Anonymous'
	};

	var timeline = $('<div>', {class: 'timeline'});
	var h;
	for (h = 0; h < 24; h++) {
		$.each(['00','30'], function(key, m) {
			timeline.append($('<div>').text(h+':'+m));
		});
	}

	$.get('https://www.dr-massive.com/api/schedules', channelQuery )
		.done(function( data ) {
		$.each(data, function(key, channelData) {

			var channel = $('<div>', {class: 'channel'});
			var programmes = $('<div>', {class: 'programmes'});
			var timelineOffset = 0;

			$.each(channelData.schedules, function(key, programmeData) {
				console.log(programmeData);
				var item = programmeData.item;
				var metadata = [];
				var duration = Math.round(Math.abs(new Date(programmeData.startDate) - new Date(programmeData.endDate)) / 60000);

				if (key == 0) {
					timelineOffset = ((new Date(today) - new Date(programmeData.startDate)) / 60000);
				}

				metadata.push(duration+' mins');

				if (item.seasonNumber) {
					metadata.push('Sæson '+item.seasonNumber);
				}
				if (item.episodeNumber) {
					metadata.push('Episode '+item.episodeNumber);
				}

				var timeslot = $('<div>', {class: 'timeslot'}).text( new Date(programmeData.startDate).toISOString().substr(11, 5) + ' - ' + new Date(programmeData.endDate).toISOString().substr(11, 5) );

				var a = $('<a>', {class: 'title'}).text(item.title)
				if (item.watchPath) {
					a.attr('href', broadcastChannel[channelData.channelId].url+item.watchPath);
				};

				var img = $('<img>');
				if (item.images.tile) {
					imgUrl = item.images.tile;
					imgUrl = imgUrl.replace('Width\=1920','Width\=180').replace('Height\=1080','Height\=101');
					img.attr('src', imgUrl);
				}

				var programme = $('<div>', {class: 'programme', programmeId: programmeData.id}).append(
					timeslot,
					a,
					$('<div>', {class: 'meta'}).text(metadata.join(', ')),
					img
				).width(duration * 4);

				if (programmeData.live) {
					programme.addClass('live');
				}

				programmes.append(programme);
			});

			channel.append(timeline.clone(),programmes);

			channel.find('.timeline').css('margin-left', (timelineOffset*4) + 'px');

			$('#page').append(
				$('<h2>', {class: 'title'}).text(broadcastChannel[channelData.channelId].name),
				channel
			);

		});
	});

});