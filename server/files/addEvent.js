window.onload = async function () {

let loginCheck = new XMLHttpRequest();
loginCheck.open("GET", "/auth");
loginCheck.send();

loginCheck.onload = async function(){

    if(loginCheck.status === 200){

        document.getElementById('eventForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            const response = await fetch('/profile/events', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });


            let textfield = document.getElementById("event");
            textfield.value = "";

            let message = document.getElementById("message");
            if(response.ok){
                message.textContent = `✅ Successfully added: ${data.event}`;
            } else{
                message.textContent = "❌ Failed to add event.";
            }

        });

    } else{
        window.location.href = '/auth.html';
    }
}}

console.log("I am in");