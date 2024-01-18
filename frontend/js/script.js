const url = `http://localhost:3000`;

function signUp(e) {

    e.preventDefault();

    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value; 
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;


    var isPasswordMatch = password === confirmPassword;
    if (!isPasswordMatch) {
        document.getElementById('passwordMain').innerText = '';
        document.getElementById('passwordError').innerText = 'Passwords do not match';
    } else
        document.getElementById('passwordError').innerText = '';


    if (isPasswordMatch) {

        var minLength = 8;
        var hasUppercase = /[A-Z]/.test(password);
        var hasLowercase = /[a-z]/.test(password);
        var hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

        if (password.length < minLength)
            document.getElementById('passwordMain').innerText = 'Password should have 8 characters';

        else if (!hasUppercase)
            document.getElementById('passwordMain').innerText = 'Password should have atleast one uppercase character';

        else if (!hasLowercase)
            document.getElementById('passwordMain').innerText = 'Password should have atleast one lowercase character';

        else if (!hasSpecialCharacter)
            document.getElementById('passwordMain').innerText = 'Password should have atleast one special character';

        else {


            let obj = {
                name,
                email,
                phone,
                password
            }

            axios.post(`${url}/users/addUser`, obj)
                .then(respond => {

                    var msg = respond.data.message;
                    var check = respond.data.check;

                    alert(`${msg}`);

                    if (check)
                        window.location.replace("./login.html");
                    else
                        window.top.location = window.top.location;
                })
                .catch(err => console.log(err));

        }
    }
}

function logIn(e) {

    e.preventDefault();

    document.getElementById('loginMessage').innerText = ``;


    var email = document.getElementById('email_login').value;
    var password = document.getElementById('password_login').value;

    let obj = {
        email,
        password
    }

    axios.post(`${url}/users/loginUser`, obj)
        .then(respond => {
            let token = respond.data.token;

            localStorage.setItem('token', token);
            localStorage.setItem('lastId', -1);
            localStorage.setItem('grpName', 'Common Group');
            localStorage.setItem('grpId', -1);

            let msg = `${respond.data.name} joined`;
            let obj = {msg};
            
            axios.post(`${url}/message/sendMsg`, obj, { headers: { "Authorization": token } })
                .then(respond => {
                    window.location.replace("./chat.html");
                })
                .catch(err => console.log(err));

        })
        .catch(err => {
            const message = err.response.data.display;
            
            document.getElementById('loginMessage').innerText = `${message}`;
            
        });

}