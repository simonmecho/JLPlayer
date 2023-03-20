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
    iframeElement.width = this.options.width || "640";
    iframeElement.height = this.options.height || "360";
    iframeElement.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframeElement.frameBorder = "0";
    iframeElement.allowFullscreen = "1";
    iframeElement.scrolling = "no";
    // Set the srcdoc attribute with the content you want to add
    //     iframeElement.srcdoc = `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //       <meta charset="UTF-8">
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //       <title>Iframe Content</title>
    //       <style>
    //         body {
    //           background-color: lightblue;
    //         }
    //       </style>
    //     </head>
    //     <body>
    //     </body>
    //     </html>
    //   `;
    this.container.parentNode.replaceChild(iframeElement, this.container);

    const iframeDoc = iframeElement.contentDocument;
    const videoElement = iframeDoc.createElement("video");
    videoElement.innerHTML = `
      <source src="${path}" type="video/mp4">
      Your browser does not support the video tag.
    `;
    videoElement.width = this.options.width || "640";
    videoElement.height = this.options.height || "360";
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
                    data: states.UNSTARTED,
                })
            );
            videoElement.addEventListener("ended", () =>
                onStateChange({
                    data: states.ENDED,
                })
            );
            videoElement.addEventListener("play", () =>
                onStateChange({
                    data: states.PLAYING,
                })
            );
            videoElement.addEventListener("pause", () =>
                onStateChange({
                    data: states.PAUSED,
                })
            );
            videoElement.addEventListener("waiting", () =>
                onStateChange({
                    data: states.BUFFERING,
                })
            );
            videoElement.addEventListener("canplay", () => {
                if (videoElement.currentTime === 0) {
                    onStateChange({
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
