var videoPlayer = {
    adv: [],
    textAdv: [],
    video: {
        source: null,
        cover: null
    },
    elem: {
        video: null,
        cover: null,
        playButton: null,
        volumeButton: null,
        volumeSlider: null,
        volume: null,
        skipButton: null,
        volumeSliderCircle: null,
        progress: null,
        progressCircle: null,
        progressDownload: null,
        watched: null,
        textAdv: null,
        player: null,
        fullScreen: null,
        duration: null,
        currentTime: null,
        playlist: null,
        playlistItem: null,
        tradeMark: null
    },
    volumeSliderCont: false,
    progressSliderCont: false,
    textAdvEndTime: 0,
    fullScreen: false,
    duration: 0,
    currentVideo: {
        name: null,
        index: null
    },
    currentTime: 0,
    init: function (e) {
        var source = e.find('source');
        for (var i = 0; i < source.length; i++) {
            var b = $(source[i]);
            if (b.attr('data-skip') == 'true') {
                videoPlayer.adv[videoPlayer.adv.length] = {
                    source: b.attr('data-src'),
                    startTime: b.attr('data-starttime'),
                    skipTime: b.attr('data-skiptime') == 'undefined' ? 5 : b.attr('data-skiptime'),
                    isEnd: false
                }
            }
            if (b.attr('data-main') == 'true') {
                videoPlayer.video = {
                    source: b.attr('data-src'),
                    cover: b.attr('data-cover')
                }
            }
            if (b.attr('data-text') == 'true') {
                videoPlayer.textAdv[videoPlayer.textAdv.length] = {
                    value: b.attr('data-value'),
                    startTime: b.attr('data-starttime'),
                    durationTime: b.attr('data-duration'),
                    href: b.attr('data-href'),
                    isEnd: false
                }
            }
        }

        $('#videoPlayer').html(`
                <video id="videoElement" autobuffer></video>
                <div id="videoCover">&nbsp;</div>
                <div id="videoSkip"><i class="fa fa-forward"></i>&nbsp; Skip At</div>
                <div id="videoTextAdv">
                    <a href="http://www.google.com" target="_blank">Ananısını sikiyim</a>
                </div>
                <div id="videoControls">
                    <div id="videoProgress">
                        <div id="videoWatched"></div>
                        <div id="videoProgressCircle"></div>
                        <div id="videoDownloaded"></div>
                    </div>
                    <div id="videoPlay">
                        <i class="fa fa-play play"></i>
                    </div>
                    <div id="videoTime">
                        <span id="videoCurrentTime">00:03</span> / <span id="videoDuration">30:03</span>
                    </div>
                    <div id="videoTradeMark">
                        <img src="assets/img/trademarklogo.png">
                    </div>
                    <div id="videoVolume">
                        <i class="fa fa-volume-up"></i>
                        <div id="videoVolumeSlider">
                            <div id="videoVolumeSliderStick"></div>
                            <div id="videoVolumeSliderCircle"></div>
                        </div>
                    </div>
                    <div id="videoFullScreen">
                        <i class="fa fa-expand"></i>
                    </div>
                </div>
        `);

        videoPlayer.elem.player = $('#videoPlayer').get(0);
        videoPlayer.elem.playlist = $('#videoPlaylist');
        videoPlayer.elem.video = $('#videoElement').get(0);
        videoPlayer.elem.cover = $('#videoCover');
        videoPlayer.elem.playButton = $('#videoPlay');
        videoPlayer.elem.volumeButton = $('#videoVolume i');
        videoPlayer.elem.volumeSlider = $('#videoVolumeSlider');
        videoPlayer.elem.volumeSliderCircle = $('#videoVolumeSliderCircle');
        videoPlayer.elem.volume = $('#videoVolume');
        videoPlayer.elem.skipButton = $('#videoSkip');
        videoPlayer.elem.progress = $('#videoProgress');
        videoPlayer.elem.progressCircle = $('#videoProgressCircle');
        videoPlayer.elem.progressDownload = $('#videoDownloaded');
        videoPlayer.elem.watched = $('#videoWatched');
        videoPlayer.elem.textAdv = $('#videoTextAdv');
        videoPlayer.elem.fullScreen = $('#videoFullScreen');
        videoPlayer.elem.currentTime = $('#videoCurrentTime');
        videoPlayer.elem.duration = $('#videoDuration');
        videoPlayer.elem.playlistItem = $('.playlistItem');
        videoPlayer.elem.tradeMark = $('#videoTradeMark');

        var w = $(videoPlayer.elem.player).width();
        $(videoPlayer.elem.player).height((9 / 16) * w);
        $(videoPlayer.elem.playlist).height((9 / 16) * w);

        var i = 0;
        for (i = 0; i < videoPlayer.adv.length; i++) {
            if (videoPlayer.adv[i].startTime == 0) {
                videoPlayer.loadVideo('<source src="' + videoPlayer.adv[i].source + '" type="video/mp4">');
                videoPlayer.currentVideo.name = "adv";
                videoPlayer.currentVideo.index = i;

                videoPlayer.adv[i].isEnd = true;
                break;
            }
        }
        if (i == videoPlayer.adv.length) {
            videoPlayer.loadVideo('<source src="' + videoPlayer.video.source + '" type="video/mp4">');
            videoPlayer.currentVideo.name = "main";
        }
        videoPlayer.elem.cover.css('background-image', 'url("' + videoPlayer.video.cover + '")');
        
        // Adding Control Event
        $(videoPlayer.elem.video).on('click', videoPlayer.changePlayingStatus);
        $(videoPlayer.elem.cover).on('click', videoPlayer.changePlayingStatus);
        $(videoPlayer.elem.playButton).on('click', videoPlayer.changePlayingStatus);
        $(videoPlayer.elem.skipButton).on('click', videoPlayer.skipAdv);
        $(videoPlayer.elem.volumeButton).on('click', videoPlayer.changeMuteStatus);
        $(videoPlayer.elem.volumeButton).on('mouseenter', videoPlayer.openVolumeSlider);
        $(videoPlayer.elem.progress).on('mouseenter', videoPlayer.openProgressSlider);
        $(videoPlayer.elem.player).on('mousedown', videoPlayer.sliderMouseDown);
        $(videoPlayer.elem.player).on('mouseup', videoPlayer.sliderMouseUp);
        $(videoPlayer.elem.player).on('mousemove', videoPlayer.sliderMouseMove);
        $(videoPlayer.elem.player).on('mouseleave', videoPlayer.sliderMouseLeave);
        $(videoPlayer.elem.player).on('mouseleave', videoPlayer.sliderMouseLeave);
        $(videoPlayer.elem.fullScreen).on('click', videoPlayer.toogleFullScreen);
        $(window).on('keyup', videoPlayer.onPressEsc);
        
        // Adding Video Event
        videoPlayer.elem.video.onplaying = videoPlayer.onPlay;
        videoPlayer.elem.video.onpause = videoPlayer.onPause;
        videoPlayer.elem.video.onvolumechange = videoPlayer.onVolumeChange;
        videoPlayer.elem.video.ontimeupdate = videoPlayer.watcher;
        videoPlayer.elem.video.onended = videoPlayer.onEnd;
        videoPlayer.elem.video.onprogress = videoPlayer.onProgress;
        
        //Playlist
        $('.playlistItem').on('click', videoPlayer.playlistInit);
    },

    loadVideo: function (source) {
        $(videoPlayer.elem.video).html(source);
        videoPlayer.elem.video.load();
        videoPlayer.elem.video.play();
        videoPlayer.elem.cover.fadeOut(400);
    },
    
    timeUpdater: function () {
        videoPlayer.elem.currentTime.html(function () {
            var ct = parseInt(videoPlayer.elem.video.currentTime);
            var ctd = parseInt(ct / 60);
            ct = ct - (ctd * 60);
            if (ct < 10){
                ct = '0' + ct.toString();
            }
            if (ctd < 10){
                ctd = '0' + ctd.toString();
            }
            return ctd + ':' + ct;
        });
        
        videoPlayer.elem.duration.html(function () {
            var ct = parseInt(videoPlayer.elem.video.duration);
            var ctd = parseInt(ct / 60);
            ct = ct - (ctd * 60);
            if (ct < 10){
                ct = '0' + ct.toString();
            }
            if (ctd < 10){
                ctd = '0' + ctd.toString();
            }
            return ctd + ':' + ct;
        });
    },

    // Control Events
    changePlayingStatus: function () {
        if (videoPlayer.elem.video.paused) {
            videoPlayer.elem.video.play();
        }
        else {
            videoPlayer.elem.video.pause();
        }
        videoPlayer.elem.cover.fadeOut(500);
    },
    
    changeMuteStatus: function () {
        if (videoPlayer.elem.video.volume > 0.1) {
            videoPlayer.oldVolume = videoPlayer.elem.video.volume;
            videoPlayer.elem.video.volume = 0;
        }
        else {
            if (typeof videoPlayer.oldVolume == typeof (0)) {
                videoPlayer.elem.video.volume = videoPlayer.oldVolume;
            }
            else {
                videoPlayer.elem.video.volume = 0.5;
            }
        }
        videoPlayer.elem.volumeSliderCircle.css('left', videoPlayer.elem.video.volume * 90);
    },
    
    openVolumeSlider: function () {
        $(videoPlayer.elem.volume).addClass('active');
        $(videoPlayer.elem.tradeMark).addClass('active');
    },
    
    openProgressSlider: function () {
        $(videoPlayer.elem.progress).addClass('active');
    },
    
    sliderMouseDown: function (e) {
        if (e.target.id == 'videoVolumeSlider' || e.target.id == 'videoVolumeSliderCircle' || e.target.id == 'videoVolumeSliderStick') {
            videoPlayer.volumeSliderCont = true;
            videoPlayer.sliderMouseMove(e);
        }
        if (e.target.id == 'videoProgress' || e.target.id == 'videoWatched' || e.target.id == 'videoProgressCircle' || e.target.id == 'videoDownloaded') {
            videoPlayer.progressSliderCont = true;
            videoPlayer.sliderMouseMove(e);
        }
    },
    
    sliderMouseUp: function (e) {
        videoPlayer.volumeSliderCont = false;
        if (videoPlayer.progressSliderCont) {
            videoPlayer.elem.video.currentTime = (parseInt($(videoPlayer.elem.progressCircle).css('left').replace(/[A-z\%]+/g, '')) / $(videoPlayer.elem.video).width()) * videoPlayer.elem.video.duration;
        }
        videoPlayer.progressSliderCont = false;
        videoPlayer.elem.progressCircle.css('transition', 'all .5s');
    },
    
    sliderMouseMove: function (e) {
        var offsetX;
        var left;
        if (videoPlayer.volumeSliderCont) {
            offsetX = $(videoPlayer.elem.volumeSlider).offset().left;
            left = e.pageX - offsetX - 6;
            if (left < 0){
                left = 0;
            }
            else if (left > 90){
                left = 90;
            }
            $(videoPlayer.elem.volumeSliderCircle).css('left', left);
            videoPlayer.elem.video.volume = (left / 90);
        }
        else if (videoPlayer.progressSliderCont) {
            videoPlayer.elem.progressCircle.css('transition', 'none');
            offsetX = $(videoPlayer.elem.video).offset().left;
            left = e.pageX - offsetX;
            var width = $(videoPlayer.elem.video).width();
            if (left < 0){
                left = 0;
            }
            else if (left > width){
                left = width;
            }
            $(videoPlayer.elem.progressCircle).css('left', left);

        }
    },
    
    sliderMouseLeave: function () {
        videoPlayer.volumeSliderCont = false;
        videoPlayer.progressSliderCont = false;
        $(videoPlayer.elem.volume).removeClass('active');
        $(videoPlayer.elem.tradeMark).removeClass('active');
        $(videoPlayer.elem.progress).removeClass('active');
    },
    
    skipAdv: function () {
        videoPlayer.loadVideo('<source src="' + videoPlayer.video.source + '#t=' + videoPlayer.currentTime + '" type="video/mp4">');
        videoPlayer.currentVideo.name = 'main';
        videoPlayer.elem.skipButton.fadeOut(400);
    },
    
    toogleFullScreen: function (end) {
        if (!videoPlayer.fullScreen && (!end || typeof end == typeof {})) {
            if (videoPlayer.elem.player.mozRequestFullScreen) {
                videoPlayer.elem.player.mozRequestFullScreen();
            }
            else {
                videoPlayer.elem.player.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            videoPlayer.fullScreen = true;
            videoPlayer.elem.fullScreen.find('i').attr('class', 'fa');
            videoPlayer.elem.fullScreen.find('i').addClass('fa-compress');
            $(videoPlayer.elem.player).removeAttr('style');
            $(videoPlayer.elem.player).addClass('fullScreen');
        }
        else {
            if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else {
                document.webkitCancelFullScreen();
            }
            videoPlayer.elem.fullScreen.find('i').attr('class', 'fa');
            videoPlayer.fullScreen = false;
            videoPlayer.elem.fullScreen.find('i').addClass('fa-expand');
            $(videoPlayer.elem.player).removeClass('fullScreen');
            $(videoPlayer.elem.player).height($(videoPlayer.elem.playlist).height());
        }
    },
    
    onPressEsc: function (e) {
        if (videoPlayer.fullScreen){
            videoPlayer.toogleFullScreen();
        }
    },
    
    // Video Events
    onPlay: function () {
        $(videoPlayer.elem.playButton).children('i')
            .removeClass('fa-play')
            .addClass('fa-pause');
    },
    
    onPause: function () {
        $(videoPlayer.elem.playButton).children('i')
            .removeClass('fa-pause')
            .addClass('fa-play');
    },
    
    onVolumeChange: function () {
        var val = videoPlayer.elem.video.volume;
        var e = $(videoPlayer.elem.volumeButton);
        e.attr('class', 'fa');
        if (val > 0.7) {
            e.addClass('fa-volume-up');
        }
        else if (val > 0.3) {
            e.addClass('fa-volume-down');
        }
        else {
            e.addClass('fa-volume-off');
        }
    },
    
    onEnd: function () {
        if (videoPlayer.currentVideo.name == 'adv') {
            videoPlayer.skipAdv();
        }
        else {
            var e = $(videoPlayer.elem.playlistItem);
            var i
            for (i = 0; i < e.length; i++) {
                if (videoPlayer.video.source == e.eq(i).attr('data-src')) {
                    if(e.eq(i+1).length != 0){
                        e.eq(i+1).trigger('click');
                        break;
                    }
                }
            }
            if (i == e.length) {
                videoPlayer.elem.watched.width('100%');
                videoPlayer.elem.progressCircle.css('left', '100%');
                videoPlayer.toogleFullScreen(true);
                videoPlayer.timeUpdater();
            }
        }
    },
    
    onProgress: function () {
        try {
            videoPlayer.elem.progressDownload.width(((videoPlayer.elem.video.buffered.end(videoPlayer.elem.video.buffered.length - 1) / videoPlayer.elem.video.duration) * 100) + '%');
        } catch (error) {

        }
    },


    watcher: function () {
        videoPlayer.timeUpdater();
        if (videoPlayer.currentVideo.name == 'adv' && !videoPlayer.elem.video.paused) {
            if (videoPlayer.elem.video.currentTime > videoPlayer.adv[videoPlayer.currentVideo.index].skipTime) {
                videoPlayer.elem.skipButton.fadeIn(400);
            }
            videoPlayer.elem.progress.fadeOut(400);
            videoPlayer.progressSliderCont = false;
        }
        if (videoPlayer.currentVideo.name == 'main' && !videoPlayer.elem.video.paused) {
            for (var i = 0; i < videoPlayer.adv.length; i++) {
                if (videoPlayer.elem.video.currentTime > videoPlayer.adv[i].startTime && !videoPlayer.adv[i].isEnd) {
                    videoPlayer.currentTime = videoPlayer.elem.video.currentTime;
                    videoPlayer.loadVideo('<source src="' + videoPlayer.adv[i].source + '" type="video/mp4">');
                    videoPlayer.currentVideo.name = 'adv';
                    videoPlayer.currentVideo.index = i;
                    videoPlayer.adv[i].isEnd = true;
                }
            }
            for (var i = 0; i < videoPlayer.textAdv.length; i++) {
                if (videoPlayer.elem.video.currentTime > videoPlayer.textAdv[i].startTime && !videoPlayer.textAdv[i].isEnd) {
                    videoPlayer.textAdv[i].isEnd = true;
                    videoPlayer.textAdvEndTime = videoPlayer.elem.video.currentTime + parseInt(videoPlayer.textAdv[i].durationTime);
                    videoPlayer.elem.textAdv.find('a').html(videoPlayer.textAdv[i].value)
                        .attr('href', videoPlayer.textAdv[i].href)
                    videoPlayer.elem.textAdv.css('right', '-300%').stop().animate({
                        'right': '0'
                    }, 1000);
                }
                if (videoPlayer.elem.video.currentTime > videoPlayer.textAdvEndTime) {
                    videoPlayer.textAdvEndTime = videoPlayer.elem.video.duration;
                    videoPlayer.elem.textAdv.stop().animate({
                        'right': '500%'
                    }, 1000);
                }

            }
            videoPlayer.elem.progress.fadeIn(400);
            videoPlayer.elem.watched.width(((videoPlayer.elem.video.currentTime / videoPlayer.elem.video.duration) * 100) + '%');
            if (!videoPlayer.progressSliderCont) {
                videoPlayer.elem.progressCircle.css({ 'left': ((videoPlayer.elem.video.currentTime / videoPlayer.elem.video.duration) * 100) + '%' });
            }
        }
    },

    playlistInit: function () {
        for (var i = 0; i < videoPlayer.adv.length; i++) {
            if (videoPlayer.adv[i].startTime == 0){
                videoPlayer.adv[i].isEnd = false;
            }
            else if ($(this).attr('data-secondadv') != "false"){
                videoPlayer.adv[i].isEnd = false;
            }
        }
        for (var i = 0; i < videoPlayer.textAdv.length; i++) {
            videoPlayer.textAdv[i].isEnd = false;
        }

        videoPlayer.video.source = $(this).attr('data-src');
        videoPlayer.video.cover = $(this).attr('data-cover');

        var i = 0;
        for (i = 0; i < videoPlayer.adv.length; i++) {
            if (videoPlayer.adv[i].startTime == 0) {
                videoPlayer.loadVideo('<source src="' + videoPlayer.adv[i].source + '" type="video/mp4">');
                videoPlayer.currentVideo.name = "adv";
                videoPlayer.currentVideo.index = i;
                videoPlayer.adv[i].isEnd = true;
                break;
            }
        }
        if (i == videoPlayer.adv.length) {
            videoPlayer.loadVideo('<source src="' + videoPlayer.video.source + '" type="video/mp4">');
            videoPlayer.currentVideo.name = "main";
        }
        
        videoPlayer.currentTime = 0;
        videoPlayer.elem.playlistItem.removeClass('active');
        $(this).addClass('active');

        videoPlayer.elem.skipButton.fadeOut(200);
        videoPlayer.elem.textAdv.stop().animate({
            'right': '500%'
        }, 1000);
    }
}

$(document).ready(function () {
    videoPlayer.init($('#videoElement'));
});
