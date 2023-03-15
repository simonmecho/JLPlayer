// Namespace for JL
var JL = {};

// Constructor function for the Player "class"
JL.Player = function (elementId, options) {
    this.container = document.getElementById(elementId);
    this.height = options.height || "360";
    this.width = options.width || "640";
    this.videoId = options.videoId;
    this.playerVars = options.playerVars;
    this.events = options.events;

    // Initialize the player
    this.init();
};

JL.Player.prototype.init = async function () {
    // logic to initialize the player
    const url =
        "https://video.avkchina.cn/api/videoFindSdk?id=" + this.options.vid;
    try {
        let response = await fetch(url, {
            method: "GET",
        });
        let { data } = await response.json();
        _createVideoElement(
            data.video,
            this.container,
            this.width,
            this.height
        );
        _createControls(this.container);
    } catch (e) {
        console.log(e);
    }
};

function _createVideoElement(path, container, width, height) {
    let videoElement = document.createElement("video");
    videoElement.width = width;
    videoElement.height = height;
    videoElement.innerHTML = `
      <source src="${path}" type="video/mp4">
      Your browser does not support the video tag.
    `;
    container.appendChild(videoElement);
}

function _createControls(container) {
    let controls = document.createElement("div");
    controls.className = "controls";
    controls.style.cssText = `
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 40px;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    let playPauseButton = document.createElement("button");
    playPauseButton.textContent = "Play/Pause";
    controls.appendChild(playPauseButton);
    container.appendChild(controls);
}

var ready = window["onJLIframeAPIReady"];
ready && ready();

//   play() {
//     this.videoElement.play();
//   }

//   pause() {
//     this.videoElement.pause();
//   }

//   togglePlayPause() {
//     if (this.videoElement.paused) {
//       this.play();
//     } else {
//       this.pause();
//     }
//   }
