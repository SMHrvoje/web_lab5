import { get, set } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";
//const resurs=require('https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm') ;
//const set=resurs.set
//const { set } = require('idb-keyval');
//import { set } from 'idb-keyval';
let title = document.getElementById("story_title");
let body = document.getElementById("speech");

document.getElementById("add_new").addEventListener('click', (event) =>{
    event.preventDefault();
    if ("serviceWorker" in navigator && "SyncManager" in window) {
        //console.log("tu2")
        let naslov = title.value;
        let tekst =body.value
        if(naslov ==='' || tekst ===''){
            alert("Please enter data")
            return
        }
        set(naslov, {
            title: naslov,
            story: tekst,
        });

        navigator.serviceWorker.ready
            .then((swRegistration)=>{
                //console.log("tu3")
                return swRegistration.sync.register("sync-snaps")
        })
            .then(() => {
                        //we passed registration
                title.value=''
                body.value=''
                    })
                    .catch((error) => {
                        alert(error);
                        console.log(error);
                    });
            }
     else {
        // fallback
        // pokusati poslati, pa ako ima mreze onda dobro...
        alert("TODO - vaš preglednik ne podržava backgound sync");
    }

})




if ("webkitSpeechRecognition" in window) {
    // Initialize webkitSpeechRecognition
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            // Microphone access granted, stream contains audio data

            let speechRecognition = new webkitSpeechRecognition();

            // String for the Final Transcript
            let final_transcript = "";

            // Set the properties for the Speech Recognition object
            speechRecognition.continuous = true;
            speechRecognition.interimResults = false;
            speechRecognition.lang ="en-US" //document.querySelector("#select_dialect").value;

            document.getElementById("start_speech").onclick=(event) => {
                event.preventDefault()
                speechRecognition.start()
            }
            document.getElementById("stop_speech").onclick=(event) => {
                event.preventDefault()
                speechRecognition.stop()
            }
            // Callback Function for the onStart Event
            speechRecognition.onstart = () => {
                // Show the Status Element
                // document.querySelector("#status").style.display = "block";
                console.log("Speech started")
                document.getElementById("start_speech").disabled = true;
                document.getElementById("stop_speech").disabled = false;
            };
            speechRecognition.onerror = () => {
                // Hide the Status Element
                //document.querySelector("#status").style.display = "none";
            };
            speechRecognition.onend = () => {
                // Hide the Status Element
                //document.querySelector("#status").style.display = "none";
                console.log("speech ended")
                document.getElementById("start_speech").disabled = false;
                document.getElementById("stop_speech").disabled = true;
            };

            speechRecognition.onresult = (event) => {
                console.log(event.results)
                // Create the interim transcript string locally because we don't want it to persist like final transcript
                //let interim_transcript = "";

                // Loop through the results from the speech recognition object.


                // Set the Final transcript and Interim transcript.
                const speech_area=document.getElementById("speech");
                const current_value=speech_area.value
                speech_area.value=current_value+event.results[event.results.length - 1][0].transcript;
                //document.querySelector("#interim").innerHTML = interim_transcript;
            };

            speechRecognition.start()

        })
        .catch((error) => {
            // Handle error
            document.getElementById("start_speech").disabled = true;
            document.getElementById("stop_speech").disabled = true;
        });

} else {
    title.classList.add("d-none")
    body.classList.add("d-none")
    console.log("Speech Recognition Not Available");
    alert("Speech Recognition is not available in your brower but you can still type the story yourself")
}
