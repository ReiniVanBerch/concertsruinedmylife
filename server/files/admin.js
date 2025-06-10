function deleteUser(name) {
    

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            let element = document.getElementById(name);
            element.remove();
        } 
    }
    xhr.open("DELETE", `/admin/users/${name}`);
    xhr.send();
}

window.onload = async function () {

    let adminCheck = new XMLHttpRequest();
    adminCheck.open("GET", "/admin/check");
    adminCheck.send();

    adminCheck.onload = async function(){
        if(adminCheck.status === 200){

            const xhr = new XMLHttpRequest();
            xhr.onload = async function () {

                const listElement = document.querySelector("#usersSection");

                if (xhr.status === 200) {
                    console.log(xhr.responseText);
                    const users = JSON.parse(xhr.responseText);

                    let notFound = document.createElement("p");
                    notFound.innerHTML = "No costpoints found...";

                    users.forEach(user => {
                        let article = document.createElement("article");
                        article.id = user.username;

                        let title = document.createElement("h2");
                        title.innerHTML = user.username;

                        
                        let costpointText = document.createElement("a");
                        costpointText.href = `/addCostpoint.html?event=${encodeURIComponent(user.username)}`;
                        costpointText.textContent = "Add Costpoint";


                        let deleteText = document.createElement("p");
                        deleteText.innerHTML = "Delete";
                        deleteText.addEventListener('click', function () {deleteUser(user.username);});


                        article.appendChild(title);
                        article.appendChild(deleteText);
                        article.appendChild(document.createElement("hr"));
                        listElement.appendChild(article);
                    });
                }
            };
            xhr.open("GET", "/admin/users");
            xhr.send();

        } else{
            window.location.href = '/';
        }
    }
};