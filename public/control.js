import { set } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";
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
                return swRegistration.sync.register("sync-stories")
        })
            .then(() => {
                        //resetiraj vrijednosti
                title.value=''
                body.value=''
                    })
                    .catch((error) => {
                        //alert(error);
                       // console.log(error);
                    });
            }
     else {
        // ne podrzava
        alert("Preglednik ne podržava background sync");
    }

})




if ("webkitSpeechRecognition" in window) {
    // ako ima pokreni
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            //imamo audio

            let speechRecognition = new webkitSpeechRecognition();

            // dok sve cuje onda bude ovo taj string
            let final_transcript = "";


            speechRecognition.continuous = true;
            speechRecognition.interimResults = false;
            speechRecognition.lang ="en-US"

            document.getElementById("start_speech").onclick=(event) => {
                event.preventDefault()
                speechRecognition.start()
            }
            document.getElementById("stop_speech").onclick=(event) => {
                event.preventDefault()
                speechRecognition.stop()
            }

            speechRecognition.onstart = () => {

                console.log("Speech started")
                document.getElementById("start_speech").disabled = true;
                document.getElementById("stop_speech").disabled = false;
            };
            speechRecognition.onerror = () => {

            };
            speechRecognition.onend = () => {

                //console.log("speech ended")
                document.getElementById("start_speech").disabled = false;
                document.getElementById("stop_speech").disabled = true;
            };

            speechRecognition.onresult = (event) => {

                const speech_area=document.getElementById("speech");
                const current_value=speech_area.value
                speech_area.value=current_value+event.results[event.results.length - 1][0].transcript;

            };
            speechRecognition.start()

        })
        .catch((error) => {
            document.getElementById("start_speech").disabled = true;
            document.getElementById("stop_speech").disabled = true;
        });

} else {
    title.classList.add("d-none")
    body.classList.add("d-none")
    //console.log("Speech Recognition Not Available");
    alert("Speech Recognition is not available in your brower but you can still type the story yourself")
}
