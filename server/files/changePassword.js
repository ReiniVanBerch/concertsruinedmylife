window.onload = async function () {

    let adminCheck = new XMLHttpRequest();
    adminCheck.open("GET", "/admin/check");
    adminCheck.send();

    adminCheck.onload = async function(){
        if(adminCheck.status === 200){

            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get("username");
            document.querySelector('input[name="username"]').value = username;

            document.getElementById('passwordForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            const response = await fetch(`/admin/users`, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });


            let message = document.getElementById("message");
            if(response.ok){
                message.textContent = `✅ Succesfully changed password`;
            } else{
                message.textContent = "❌ Failed to change password.";
            }

        });

        } else{
            window.location.href = '/';
        }
    }
};