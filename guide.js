$().ready(function() {

	var minuteMultipier = 5.4;
	var today = moment().startOf('day');
	var now = moment();

	var broadcastChannel = {
		20875: {name: 'DR1', url: 'https://www.dr.dk/drtv'},
		20876: {name: 'DR2', url: 'https://www.dr.dk/drtv'}
	};
	var channelQuery = {
		channels: '20875,20876',
		date: today.format('YYYY-MM-DD'),
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
	var h = 0; var i = 0;
	for (i = 0; i < 26; i++) {
		if (h == 24) {
			h = 0;
		}
		$.each(['00','30'], function(key, m) {
			timeline.append($('<div>').text(h+':'+m).width((30 * minuteMultipier)-1));
		});
		h++;
	}

	$.get('https://www.dr-massive.com/api/schedules', channelQuery )
		.done(function( data ) {
		$.each(data, function(key, channelData) {

			var channel = $('<div>', {class: 'channel', id: channelData.channelId});
			var programmes = $('<div>', {class: 'programmes'}).width(1440 * minuteMultipier);
			var timelineOffset = 0;
			var scrollTo = 0;

			$.each(channelData.schedules, function(key, programmeData) {

				console.log(programmeData);

				var item = programmeData.item;
				var metadata = [];

				var startDate = moment(programmeData.startDate);
				var endDate = moment(programmeData.endDate);
				var duration = Math.round(Math.abs(new Date(programmeData.startDate) - new Date(programmeData.endDate)) / 60000);

				var offset = Math.round(startDate.diff(today) / 60000);

				if (key == 0) {
					timelineOffset = (startDate > today) ? -offset:offset;
				}

				metadata.push(duration+' mins');

				if (item.seasonNumber) {
					metadata.push('Sæson '+item.seasonNumber);
				}
				if (item.episodeNumber) {
					metadata.push('Episode '+item.episodeNumber);
				}

				var timeslot = $('<div>', {class: 'timeslot'}).text( startDate.format('HH:mm') + ' - ' + endDate.format('HH:mm') );

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
				).width((duration * minuteMultipier) - 1).css('left', ((offset * minuteMultipier) + (timelineOffset * minuteMultipier)) + 'px');

				if (programmeData.live) {
					programme.addClass('live');
				}

				if (now > startDate && now < endDate) {
					programme.addClass('current');
					scrollTo = (offset * minuteMultipier) - 500;
					if (!a.attr('href')) {
						programme.find('a').attr('href', broadcastChannel[channelData.channelId].url + '/kanal/' + channelData.channelId);
					}
				}

				programmes.append(programme);
			});

			channel.append(timeline.clone(),programmes);

			channel.find('.timeline').css('margin-left', (timelineOffset * minuteMultipier) + 'px');

			$('#page').append(
				$('<h2>', {class: 'title'}).text(broadcastChannel[channelData.channelId].name),
				channel
			);

			$('#'+channelData.channelId).scrollLeft( scrollTo );

		});
	});
});