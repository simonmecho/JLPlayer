// Namespace for JL
var JL = {};

const states = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
};

JL.PlayerState = states;

// Constructor function for the Player "class"
JL.Player = function (elementId, options) {
    if (!elementId) {
        console.error("elementId is required");
        return;
    }
    if (!options || typeof options != "object") {
        console.error("invalid options");
        return;
    } else if (!options.vid) {
        console.error("vid is required");
        return;
    }
    this.container = document.getElementById(elementId);
    this.options = options;
    // Initialize the player
    this.init();
};

JL.Player.prototype.init = function () {
    // load video path and create video element
    const url =
        "https://video.avkchina.cn/api/videoFindSdk?id=" + this.options.vid;
    let self = this;
    fetch(url)
        .then((response) => response.json())
        .then(({ data: { video } }) => self.__createVideoElement(video));
};

JL.Player.prototype.__createVideoElement = function (path) {
    const videoElement = document.createElement("video");
    videoElement.innerHTML = `
      <source src="${path}" type="video/mp4">
      Your browser does not support the video tag.
    `;
    videoElement.width = this.options.width || "640";
    videoElement.height = this.options.height || "360";
    const { playerVars, events } = this.options;
    if (playerVars) {
        playerVars.loop && videoElement.setAttribute("loop", "");
        playerVars.autoplay && videoElement.setAttribute("autoplay", "");
        playerVars.controls && videoElement.setAttribute("controls", "");
    }
    if (events) {
        // events.onReady &&
        //     videoElement.addEventListener("oncanplay", events.onReady);

        const { onStateChange, onReady } = events;
        if (onReady) {
            videoElement.onloadeddata = onReady;
        }
        if (onStateChange) {
            videoElement.oncuechange = (e) =>
                onStateChange({ data: states.CUED });
            videoElement.onended = (e) => onStateChange({ data: states.ENDED });
            videoElement.onpause = (e) =>
                onStateChange({ data: states.PAUSED });
            videoElement.onplaying = (e) =>
                onStateChange({ data: states.PLAYING });
            videoElement.onwaiting = (e) =>
                onStateChange({ data: states.BUFFERING });
        }
    }
    this.videoElement = videoElement;

    this.container.appendChild(videoElement);
};

// controls
JL.Player.prototype.playVideo = function () {
    if (!this.videoElement.paused) return;
    this.videoElement.play();
};

JL.Player.prototype.pauseVideo = function () {
    if (this.videoElement.paused) return;
    this.videoElement.pause();
};

JL.Player.prototype.mute = function () {
    this.videoElement.muted = true;
};

JL.Player.prototype.unMute = function () {
    this.videoElement.muted = false;
};

JL.Player.prototype.isMuted = function () {
    return this.videoElement.muted;
};

// valid range from 0 ~ 100
JL.Player.prototype.setVolume = function (volume) {
    this.videoElement.volume = volume / 100.0;
};

JL.Player.prototype.getVolume = function () {
    return this.videoElement.volume * 100;
};

var ready = window["onJLIframeAPIReady"];
ready && ready();
