console.log("javascript is running");



let currentsong = new Audio();
let songs;
let currFolder;





function convertSecondsToMinutes(seconds) {
    // Ensure the input is a number
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Round down the input to the nearest integer if it has a fractional part
    seconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    // Pad single-digit minutes and seconds with leading zeros
    let paddedMinutes = String(minutes).padStart(2, '0');
    let paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return paddedMinutes + ":" + paddedSeconds;
}










async function getsongs(folder) {
    // function to parse the songs
    currFolder = folder;

    // TO SHOW SITE IN LOCAL HOST
    // let a = await fetch(`http://127.0.0.1:1000/${folder}/`)
    
    // let a = await fetch(`/${folder}/`)
    
    let a = await fetch(`/${currFolder}/`)
    
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
    }
    }



    //   show all the songs in the playlist

    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                         <div class="info">
                             <div> ${song.replaceAll("%20", " ")}</div>
                             
                             
                         </div>

                         <div class="play-now">
                             <span>play Now</span>
                             <img class="invert" src="img/play.svg" alt="">
                         </div>
                     </li>`;

    }
    // attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play();
        playee.src = "img/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00/00:00"

}


async function displayAlbums() {
    console.log("displaying albums")
    // TO SHOW SITE ON LOCAL HOST
    // let a = await fetch(`http://127.0.0.1:1000/songs/`)
    let a = await fetch(`/songs/`)

    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".card-container");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];



        // TO SHOW SITE ON LOCAL HOST
        // if (e.href.includes("/songs")) {

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {

        



            // let folder =    console.log(e.href.split("/").slice(-2)[0]);
            let folder = e.href.split("/").slice(-2)[0]

            // get the metadata of the folder

            // TO SHOW SITE ON LOCAL HOST
            // let a = await fetch(`http://127.0.0.1:1000/songs/${folder}/info.json`)

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)

            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div  class="play">
                            <img src="img/playbutton.svg" alt="">
                        </div>

                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }
    }

    // load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])

        })
    })

}


async function main() {




    // get the list of all songs
    // await getsongs("songs/MyLibrary");
    // await getsongs("songs/cs");
    await getsongs("songs/TopHits");


    playMusic(songs[0], true)



    // display all the albums on the page

    displayAlbums();







    // attach an event listener to play, next and previous
    playee.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playee.src = "img/pause.svg";

        }
        else {
            currentsong.pause();
            playee.src = "img/play.svg";

        }

    })

    //  listen for time event update

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)} / ${convertSecondsToMinutes(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // add an event listener to the seek bar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration) * percent / 100;
    })


    // add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add event listener for closing the hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // add an event listener for previous and next button

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })
    next.addEventListener("click", () => {
        // currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })


    // add an event listener for the volume button

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to:", e.target.value, "/100");
        currentsong.volume = parseInt(e.target.value) / 100;
        if( currentsong.volume > 0){
            document.querySelector(".volume>img").src  = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }

    })

    // add an event listener to mute the volume button
    document.querySelector(".volume>img").addEventListener("click", e => {
        // console.log(e.target);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;

            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;

        }
    })

    // add an event listener to open the hamburger when we click on any card
    document.querySelector(".card-container").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

}
main()























