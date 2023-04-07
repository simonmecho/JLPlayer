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
    const iframeElement = document.createElement("iframe");
    iframeElement.style.width = this.options.width || "100%";
    iframeElement.style.height = this.options.height || "100%";
    iframeElement.style.margin = "0";
    iframeElement.style.padding = "0";
    iframeElement.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframeElement.frameBorder = "0";
    iframeElement.allowFullscreen = "1";
    iframeElement.scrolling = "no";
    this.container.parentNode.replaceChild(iframeElement, this.container);

    const iframeDoc = iframeElement.contentDocument;
    const videoElement = iframeDoc.createElement("video");
    videoElement.innerHTML = `
      <source src="${path}" type="video/mp4">
      Your browser does not support the video tag.
    `;
    videoElement.style.width = this.options.width || "100%";
    videoElement.style.height = this.options.height || "100%";
    videoElement.muted = true;
    const { playerVars, events } = this.options;
    if (playerVars) {
        playerVars.loop && videoElement.setAttribute("loop", "");
        playerVars.controls && videoElement.setAttribute("controls", "");
        if (playerVars.autoplay) {
            videoElement.autoplay = true;
        }
    }
    if (events) {
        const { onStateChange, onReady } = events;
        onReady && videoElement.addEventListener("canplay", (e) => onReady(e));

        if (onStateChange) {
            videoElement.addEventListener("loadstart", () =>
                onStateChange({
                    target: this,
                    data: states.UNSTARTED,
                })
            );
            videoElement.addEventListener("ended", () =>
                onStateChange({
                    target: this,
                    data: states.ENDED,
                })
            );
            videoElement.addEventListener("play", () =>
                onStateChange({
                    target: this,
                    data: states.PLAYING,
                })
            );
            videoElement.addEventListener("pause", () =>
                onStateChange({
                    target: this,
                    data: states.PAUSED,
                })
            );
            videoElement.addEventListener("waiting", () =>
                onStateChange({
                    target: this,
                    data: states.BUFFERING,
                })
            );
            videoElement.addEventListener("canplay", () => {
                if (videoElement.currentTime === 0) {
                    onStateChange({
                        target: this,
                        data: states.CUED,
                    });
                }
            });
        }
    }
    this.videoElement = videoElement;
    this.iframeElement = iframeElement;
    iframeDoc.body.appendChild(videoElement);
};

// controls
JL.Player.prototype.playVideo = function () {
    this.videoElement.play();
};

JL.Player.prototype.stopVideo = function () {
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

JL.Player.prototype.getPlayerState = function () {
    // -1 - unstarted
    if (this.videoElement.currentTime === 0 && this.videoElement.paused) {
        return states.UNSTARTED;
    }
    // 0 - ended
    if (this.videoElement.ended) {
        return states.ENDED;
    }
    // 1 - playing
    if (!this.videoElement.paused && this.videoElement.readyState >= 4) {
        return states.PLAYING;
    }
    // 2 - paused
    if (this.videoElement.paused && this.videoElement.currentTime > 0) {
        return states.PAUSED;
    }
    // 3 - buffering
    if (this.videoElement.readyState < 4 && this.videoElement.readyState > 0) {
        return states.BUFFERING;
    }
    // 5 - video cued
    if (this.videoElement.readyState === 0) {
        return states.CUED;
    }

    return states.UNSTARTED;
};

JL.Player.prototype.getIframe = function () {
    return this.iframeElement;
};

var ready = window["onJLIframeAPIReady"];
ready && ready();
