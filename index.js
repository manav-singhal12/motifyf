// console.log("Hello")
let currentSong = new Audio();
let play = document.querySelector(".play");
let songs;
let currFolder;

// Helper function to construct URL paths
function getBaseURL() {
    return window.location.origin + window.location.pathname;
}

function getPath(folder) {
    return `${getBaseURL()}/${folder}/`;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let url = getPath(folder);
    let response = await fetch(url);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
        <i id="m" class="fa-solid fa-music"></i>
        <div class="songsinfo">
            <p1>${song.replaceAll("%20", " ")}</p1>
            <br>
            <p2>Artist Name: ${folder.replaceAll("%20", " ").replaceAll("songs/", " ")}</p2>
        </div>
        <i id="p" class="fa-solid fa-play"></i>
    </li>`;
    }
    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", event => {
            playMusic(e.querySelector(".songsinfo p1").innerHTML.trim());
        });
    });
    return songs;
}

async function playMusic(track, pause = false) {
    currentSong.src = `${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/02:52";
}

async function displayAlbums() {
    let url = getPath("songs");
    let response = await fetch(url);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.querySelector("#files a");
    let cardcontainer = document.querySelector(".rightsecondtwo");

    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0];
            let infoUrl = getPath(`songs/${folder}/info.json`);
            let infoResponse = await fetch(infoUrl);
            let info = await infoResponse.json();
            cardcontainer.innerHTML += `
                <div data-folder="${folder}" class="song">
                    <div class="">
                        <i class="fa-solid fa-play"></i>
                    </div>
                    <img class="img" src="${getPath(`songs/${folder}/cover.webp`)}">
                    <p1><b>${info.title}</b></p1>
                    <br>
                    <p2>${info.description}</p2>
                </div>`;
        }
    }

    Array.from(document.getElementsByClassName("song")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
    return songs;
}

async function main() {
    await getsongs("songs/paradox");
    playMusic(songs[0], true);
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
        if (Math.abs(currentSong.currentTime - currentSong.duration) < 0.9) {
            play.src = "play.svg";
        }
    });

    document.querySelector(".signup").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".close").style.display = "block";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.querySelector(".next").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
            play.src = "pause.svg";
        } else {
            play.src = "play.svg";
        }
    });

    document.querySelector(".previous").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
            play.src = "pause.svg";
        } else {
            play.src = "play.svg";
        }
    });

    document.querySelector(".timevol input").addEventListener("change", (e) => {
        currentSong.volume = parseFloat(e.target.value / 100);
    });

    let volume = document.querySelector(".vol img");
    volume.addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".vol input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 1;
            document.querySelector(".vol input").value = 100;
        }
    });

    const songItems = document.querySelectorAll(".songlist li");
    songItems.forEach((songItem, index) => {
        songItem.addEventListener("click", () => {
            if (index < songs.length) {
                const songName = songs[index];
                playMusic(songName);
            } else {
                console.error("Index out of bounds for songs array.");
            }
        });
    });
}

main();
