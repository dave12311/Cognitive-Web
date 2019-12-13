function login(){
    var request = new XMLHttpRequest();

    request.open('POST', '/api/login', true);
    request.setRequestHeader('Content-type', 'application/json');

    var credentials = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    request.onload = function(){
        if(this.status == 200){
            window.location.replace('/users/dashboard');
        }else{
            alertify.set('notifier','position', 'top-right');
            alertify.error("Helytelen felhasználónév vagy jelszó!");
        }
    }

    request.send(JSON.stringify(credentials));
}

function load(){
    var input = document.getElementById('password');

    input.addEventListener('keydown', function(event){
        if(event.keyCode === 13){
            event.preventDefault();
            login();
        }
    });

    var request = new XMLHttpRequest();
    request.open('GET', '/api/checklogin', true);
    request.onload = function(){
        if(this.status == 200){
            document.write(this.response);
        }
    }
    request.send();
}