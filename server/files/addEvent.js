window.onload = async function () {

let loginCheck = new XMLHttpRequest();
loginCheck.open("GET", "/auth");
loginCheck.send();

loginCheck.onload = async function(){

    if(loginCheck.status === 200){

    document.getElementById('eventForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        fetch('/profile/events', {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            let textfield = document.getElementById("event");
            textfield.value = "";
        });
    } else{
        window.location.href = '/auth.html';
    }
}}

console.log("I am in");