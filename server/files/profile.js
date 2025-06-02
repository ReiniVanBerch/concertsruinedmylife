function deleteEvent(id) {
    
    console.log("starting deletion");

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
        let element = document.getElementById(id);
        element.remove();
        console.log('deleted successfully:', xhr.responseText);
        } else {
        console.error('Failed to delete:', xhr.status, xhr.statusText);
        }
    }
    xhr.open("DELETE", `/profile/events/${id}`);
    xhr.send();


}

window.onload = function () {

    let loginCheck = new XMLHttpRequest();
    loginCheck.open("GET", "/auth");
    loginCheck.send();

    loginCheck.onload = function(){
    console.log(loginCheck.status);

        if(loginCheck.status === 200){


        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const listElement = document.querySelector("#eventsSection");

            if (xhr.status === 200) {
            const events = JSON.parse(xhr.responseText);
            events.forEach(event => {
                let article = document.createElement("article");
                article.id = event.id;
                article.innerHTML = event.name;

                let deleteText = document.createElement("p");
                deleteText.innerHTML = "Delete";
                deleteText.addEventListener('click', function () {
                    deleteEvent(event.id);
                });

                article.appendChild(deleteText);
                article.appendChild(document.createElement("hr"));
                listElement.appendChild(article);
            });



            const firstButton = document.querySelector("nav button");
            if (firstButton) {
                firstButton.click();
            }
            } else {
            listElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
            }
        };
        xhr.open("GET", "/profile/events");
        xhr.send();

        }
        else{
            window.location.href = '/auth.html';
        }
    }

};