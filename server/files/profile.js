

function deleteEvent(id) {
    

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



function deleteCostpoint(id) {
    console.log(id);

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
        let element = document.getElementById(`c${id}`);
        element.remove();
        console.log('deleted successfully:', xhr.responseText);
        } else {
        console.error('Failed to delete:', xhr.status, xhr.statusText);
        }
    }
    xhr.open("DELETE", `/profile/costpoint/${id}`);
    xhr.send();


}

async function getCostpoints() {
    try {
        const res = await fetch("/profile/costpoints");
        if (!res.ok) throw new Error("Failed to fetch costpoints");

        const data = await res.json();
        console.log(res.status);
        console.log(data);
        let output = {};

        if(res.status == 200){
            data.forEach(costpoint => {
                console.log(output)
                let costpointTr = document.createElement("tr");
                console.log(costpoint.id);

                costpointTr.id = `c${costpoint.id}`;

                let costpointTrText = document.createElement("td");
                costpointTrText.textContent = costpoint.text;

                let costpointTrCost = document.createElement("td");
                costpointTrCost.textContent = costpoint.cost;

                let costpointTrDelete = document.createElement("td");
                costpointTrDelete.textContent = "🗑️";

                costpointTrDelete.addEventListener("click", function () {
                    deleteCostpoint(costpoint.id);
                });

                costpointTr.appendChild(costpointTrText);
                costpointTr.appendChild(costpointTrCost);
                costpointTr.appendChild(costpointTrDelete);

                if (!output[costpoint.eventID]) {
                    let costpointsTable = document.createElement("table");
                    costpointsTable.innerHTML = "<tr><th>Costpoint</th><th>Cost</th><th>Delete</th></tr>";
                    output[costpoint.eventID] = costpointsTable;
                }

                output[costpoint.eventID].appendChild(costpointTr);
            });
            return output;
        } else{
            const errorText = document.createElement("p");
            errorText.innerHTML = "No Costpoints found";
            return errorText;
        }



    } catch (e) {
        const errorText = document.createElement("p");
        errorText.innerHTML = "No Costpoints found";
        return errorText;
    }
}



window.onload = async function () {

    let loginCheck = new XMLHttpRequest();
    loginCheck.open("GET", "/auth");
    loginCheck.send();

    loginCheck.onload = async function(){

        if(loginCheck.status === 200){


        const xhr = new XMLHttpRequest();
        xhr.onload = async function () {
            let costpoints = await getCostpoints();
            //console.log(costpoints);


            const listElement = document.querySelector("#eventsSection");

            if (xhr.status === 200) {
            const events = JSON.parse(xhr.responseText);

            let notFound = document.createElement("p");
            notFound.innerHTML = "No costpoints found...";

            events.forEach(event => {
                let article = document.createElement("article");
                article.id = event.id;

                let title = document.createElement("h2");
                title.innerHTML = event.name;

                let secondRow = document.createElement("div");
                
                let costpointText = document.createElement("a");
                costpointText.href = `/addCostpoint.html?event=${encodeURIComponent(event.id)}`;
                costpointText.textContent = "Add Costpoint";


                let deleteText = document.createElement("p");
                deleteText.innerHTML = "Delete";
                deleteText.addEventListener('click', function () {
                    deleteEvent(event.id);
                });

                let patchText = document.createElement("a");
                patchText.innerHTML = "Alter me!";
                patchText.href = `/patchEvent.html?event=${encodeURIComponent(event.id)}`;


                if(costpoints[event.id]){
 
                    secondRow.appendChild(costpoints[event.id]);
                } else{
                    secondRow.appendChild(notFound.cloneNode(true));
                }


                secondRow.appendChild(costpointText);
                secondRow.appendChild(deleteText);
                secondRow.appendChild(patchText);


                article.appendChild(title);
                article.appendChild(secondRow);
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