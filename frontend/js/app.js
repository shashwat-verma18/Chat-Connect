const url = `http://localhost:3000`;
let socket = io(url);

var timer = null;

function logOut() {
    localStorage.removeItem('token');
    history.replaceState(null, null, document.URL);
    window.location.replace("./login.html");
}

function send(e) {
    e.preventDefault();

    var msg = document.getElementById('msg').value;

    let obj = { msg };

    let token = localStorage.getItem('token');
    let grpId = localStorage.getItem('grpId');

    document.getElementById('msg').value = '';

    axios.post(`${url}/message/sendMsg?grpId=${grpId}`, obj, { headers: { "Authorization": token } })
        .then(respond => {

            socket.emit('send-message', (grpId));

        })
        .catch(err => console.log(err));
}

window.addEventListener("DOMContentLoaded", () => {
    let token = localStorage.getItem('token');
    if (!token) {
        window.location.replace("./login.html");
    }

    let groupName = localStorage.getItem('grpName');

    document.getElementById('appName').innerHTML = groupName;

    const msg = [];

    localStorage.setItem('messages', JSON.stringify(msg));
    localStorage.setItem('lastId', -1);

    if (groupName === 'Common Group') {
        document.getElementById('members').style.display = 'none';
    } else {
        document.getElementById('members').style.display = 'block';
    }

    displayGroups();

    displayRecentMessages();

    document.getElementById('olderMessages').style.display = 'block';


});

socket.on('display-group', data => {
    displayGroups();
})

function displayGroups() {

    let token = localStorage.getItem('token');

    axios.get(`${url}/group/getGroups`, { headers: { "Authorization": token } })
        .then(respond => {
            const ul = document.getElementById('nav_grp');

            ul.innerHTML = '';

            const arr = respond.data.userGroups;

            var li = document.createElement('li');
            li.id = 'grp_li';
            li.onclick = openGroup;
            li.appendChild(document.createTextNode(`Common Group`));
            li.value = `-1`;
            ul.appendChild(li);

            for (let i = 0; i < arr.length; i++) {
                var li = document.createElement('li');
                li.id = 'grp_li';
                li.onclick = openGroup;
                li.value = `${arr[i].id}`;

                li.appendChild(document.createTextNode(`${arr[i].name}`));

                ul.appendChild(li);
            }

            var li = document.createElement('li');
            li.id = 'grp_li';
            li.onclick = function () {
                location.href = `./createGroup.html`
            };
            li.appendChild(document.createTextNode(`Create New Group`));

            ul.appendChild(li);
        })
        .catch(err => console.log(err));
}

socket.on('receive-message', data => {
    displayRecentMessages();
})

function displayRecentMessages() {
    const token = localStorage.getItem('token');

    var id = localStorage.getItem('lastId') || -1;
    var grpId = localStorage.getItem('grpId');


    let oldMsg = JSON.parse(localStorage.getItem('messages')) || [];

    axios.get(`${url}/message/getMsg?id=${id}&grpId=${grpId}`, { headers: { "Authorization": token } })
        .then((respond) => {


            let newMsg = [];

            for (let i = respond.data.length - 1; i >= 0; i--) {

                let msg = {
                    id: respond.data[i].id,
                    body: {
                        message: respond.data[i].message,
                        name: respond.data[i].user.name
                    }
                };

                newMsg.push(msg);

                localStorage.setItem('lastId', respond.data[i].id);

            }

            id = localStorage.getItem('lastId');

            let finalMsg = oldMsg.concat(newMsg);
            finalMsg = finalMsg.slice(-10);

            localStorage.setItem('messages', JSON.stringify(finalMsg));

            document.getElementById('msgTable').innerHTML = '';

            for (let i = 0; i < finalMsg.length; i++) {
                showMessage((finalMsg[i].body));
            }

            document.getElementById('olderMessages').style.display = 'block';

        })
        .catch(err => console.log(err.toString()));
}

function olderMessages() {

    const token = localStorage.getItem('token');
    const grpId = localStorage.getItem('grpId');

    axios.get(`${url}/message/oldMsg?grpId=${grpId}`, { headers: { "Authorization": token } })
        .then((respond) => {

            clearInterval(timer);

            document.getElementById('olderMessages').style.display = 'none';

            document.getElementById('msgTable').innerHTML = '';

            for (let i = 0; i < respond.data.length; i++) {
                let obj = {
                    message: respond.data[i].message,
                    name: respond.data[i].user.name
                }

                showMessage(obj);
            }
        })
        .catch(err => console.log(err));

}

function showMessage(obj) {

    var name = obj.name;
    var msg = obj.message;
    
    var decodedToken = parseJwt(localStorage.getItem('token'));
    if (decodedToken.name === name)
        name = 'You';
    
    var table = document.getElementById('msgTable');

    var tr = document.createElement('tr');
    var td = document.createElement('td');

    if(msg.includes('https://group-chat-18')){
        var div1 = document.createElement('div');
        div1.appendChild(document.createTextNode(`${name} : `));
        div1.appendChild(document.createElement("br"));
        var img = document.createElement('img');
        img.src = msg;
        img.alt = 'Multimedia';
        img.style.width = '200px';
        img.style.height = '200px';
        img.style.marginTop = '5px';
        img.style.marginBottom = '2px';
        // img.style.border = '1px solid';/
        img.style.boxShadow= '0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19)';
        div1.appendChild(img);

        td.appendChild(div1);

    }else{
        var val = getMsg(name, msg);
        td.appendChild(document.createTextNode(`${val}`));
    }
    
    tr.appendChild(td);

    table.appendChild(tr);
}

function getMsg(name, msg) {
    

    if (msg.includes(`joined`)) {
        val = `${name} joined`;
    } else {
        val = name + ' : ' + msg;
    }

    return val;
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function openGroup(e) {
    const grpId = e.target.value || -1;
    const grpName = e.target.innerHTML;

    localStorage.setItem('grpName', grpName);
    localStorage.setItem('grpId', grpId);

    window.location.reload();

}

function viewMembers(){
    let token = localStorage.getItem('token');
    let grpId = localStorage.getItem('grpId');

    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'block';

    axios.get(`${url}/group/getMembers?grpId=${grpId}`, {headers : { "Authorization": token }})
    .then(respond => {
        const users = respond.data.users.users;

        const userId = parseJwt(token).userId;

        const logIn = Object.keys(users).find(key => users[key].id === userId);

        const grpName = localStorage.getItem('grpName');

        document.getElementById('grpName').innerHTML = grpName;

        const table = document.getElementById('users');
        table.innerHTML = '';

        for(let i=0;i<users.length;i++){
            var tr = document.createElement('tr');

            var td1 = document.createElement('td');
            td1.id = 'userName';
            td1.appendChild(document.createTextNode(users[i].name));
            td1.value = users[i].id;

            var td2 = document.createElement('td');
            var td3 = document.createElement('td');

            if(users[i].id === userId){
                if(users[i].userGroup.isAdmin === '1'){
                    td3.id = 'isAdmin';
                    td3.appendChild(document.createTextNode(`Admin`));
                }
            }
            else{
                if(users[logIn].userGroup.isAdmin === '1'){
                    if(users[i].userGroup.isAdmin === '1'){
                        td2.id = 'isAdmin';
                        td2.appendChild(document.createTextNode(`Admin`));

                        var remove = document.createElement('button');
                        remove.id = 'removeUser';
                        remove.appendChild(document.createTextNode('Remove User'));
                        remove.value = users[i].id;
                        td3.appendChild(remove);

                    }

                    else{
                        var makeAdmin = document.createElement('button');
                        makeAdmin.id = 'makeAdmin';
                        makeAdmin.onclick = makeUserAdmin;
                        makeAdmin.appendChild(document.createTextNode('Make Admin'));
                        makeAdmin.value = users[i].id;
                        td2.appendChild(makeAdmin);

                        var remove = document.createElement('button');
                        remove.id = 'removeUser';
                        remove.onclick = removeUser;
                        remove.appendChild(document.createTextNode('Remove User'));
                        remove.value = users[i].id;
                        td3.appendChild(remove);
                    }
                }else{
                    if(users[i].userGroup.isAdmin === '1'){
                        td3.id = 'isAdmin';
                        td3.appendChild(document.createTextNode(`Admin`));
                    }
                }
            }

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);

            table.appendChild(tr);
        }
    })
    .catch(err => console.log(err));
}

function closeView(){
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
}

function makeUserAdmin(e){
    const token = localStorage.getItem('token');

    const userId = e.target.value;

    const grpId = localStorage.getItem('grpId');

    let obj = {
        userId: userId,
        groupId: grpId
    }

    axios.post(`${url}/group/makeAdmin`, obj, {headers: {"Authorization": token}})
    .then(respond => {
        socket.emit('make-admin', (grpId));
        
    }).catch(err => console.log(err));

}

socket.on('display-members', data => {
    viewMembers();
})

function removeUser(e){
    const token = localStorage.getItem('token');
    
    const userId = e.target.value;

    const grpId = localStorage.getItem('grpId');

    let obj = {
        userId: userId,
        groupId: grpId
    }

    axios.post(`${url}/group/removeUser`, obj, {headers: {"Authorization": token}})
    .then(respond => {
        socket.emit('remove-user', (grpId));
    }).catch(err => console.log(err));

}

function plus(e){
    e.preventDefault();

    document.getElementById('fileInput').click();
}

function attach(e){

    let token = localStorage.getItem('token');
    let grpId = localStorage.getItem('grpId');

    let fileInput = document.getElementById('fileInput');

    var formData = new FormData();
    formData.append('file', fileInput.files[0]);
    

    axios.post(`${url}/message/sendFile?grpId=${grpId}`, formData, { headers: { 
        "Authorization": token,
        'Content-Type': 'multipart/form-data' 
    }})
    .then(respond => {
        socket.emit('send-message', (grpId));

    })
    .catch(err => console.log(err));
}