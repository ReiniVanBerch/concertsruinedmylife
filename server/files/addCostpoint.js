
window.onload = async function () {

let loginCheck = new XMLHttpRequest();
loginCheck.open("GET", "/auth");
loginCheck.send();

loginCheck.onload = async function(){

    if(loginCheck.status === 200){

        const urlParams = new URLSearchParams(window.location.search);
        const eventID = urlParams.get("event");
        document.querySelector('input[name="eventID"]').value = eventID;

        document.getElementById('costpointForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            fetch('/profile/costpoint', {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            let textfield = document.getElementById("text");
            textfield.value = "";

            let costfield = document.getElementById("cost");
            costfield.value = "";
        });
    } else{
        window.location.href = '/auth.html';
    }
}}

console.log("I am in");