window.onload = async function () {

let loginCheck = new XMLHttpRequest();
loginCheck.open("GET", "/auth");
loginCheck.send();

loginCheck.onload = async function(){

    if(loginCheck.status === 200){

        const urlParams = new URLSearchParams(window.location.search);
        const eventID = urlParams.get("event");
        document.querySelector('input[name="eventID"]').value = eventID;
        
        console.log("Reconfigured:");
        document.getElementById('eventForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            console.log("Sending fetch to:");
            console.log(`/profile/events/${eventID}`);
            const response = await fetch(`/profile/events`, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });


            let message = document.getElementById("message");
            if(response.ok){
                message.textContent = `✅ Successfully added: ${data.event}`;
            } else{
                message.textContent = "❌ Failed to rename event.";
            }

            let textfield = document.getElementById("event");
            textfield.value = "";
        });
    } else{
        window.location.href = '/auth.html';
    }
}}

console.log("I am in");