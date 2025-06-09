window.onload = async function () {

    let adminCheck = new XMLHttpRequest();
    adminCheck.open("GET", "/admin/check");
    adminCheck.send();

    adminCheck.onload = async function(){
        if(adminCheck.status === 200){


        } else{

        }
    }
};