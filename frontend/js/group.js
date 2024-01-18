const url = `http://localhost:3000`;
let socket=io(url);

var users;

window.addEventListener("DOMContentLoaded", () => {
    let token = localStorage.getItem('token');

    axios.get(`${url}/users/getAll`, {headers : {Authorization : token}})
    .then(respond => {
        const allUsers = respond.data.users;

        users = allUsers;
        showUsers();
        
    })
    .catch(err => console.log(err));
});

function showUsers(){
    const userList = document.getElementById('userList');

    users.forEach(user => {

            var con = document.createElement('div');
            con.id=`singleUser${user.id}`;
            con.style.display = 'flex';
            con.className = 'con';

            var div2 = document.createElement('div');
            div2.appendChild(document.createTextNode(`${user.name}`));
            div2.style.float = 'left';
            div2.style.textAlign = 'left';
            div2.style.width = '90%';

            var checkbox = document.createElement('input');
            checkbox.style.float = 'right';
            checkbox.type = 'checkbox';
            checkbox.name = 'selectedUsers';
            checkbox.value = user.id;
            checkbox.style.marginTop= '7px';

            con.appendChild(div2);
            con.appendChild(checkbox);

            userList.appendChild(con);
    });

}

function filterUsers() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const userList = document.getElementById('userList');

    Array.from(userList.children).forEach(childElement => {
        var divTxt = childElement.children[0].innerHTML.toLowerCase();
        if(divTxt.includes(searchTerm)){
            childElement.style.display='flex';
        }else{
            childElement.style.display='none';
        }
    });
}

function createGroup(e){

    e.preventDefault();

    event.preventDefault();

    
    const selectedUsers = Array.from(document.getElementsByName('selectedUsers'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => parseInt(checkbox.value));

    
    const groupName = document.getElementById('groupName').value;

    let obj = {
        groupName : groupName,
        users : selectedUsers
    }

    let token = localStorage.getItem('token');

    axios.post(`${url}/group/create`, obj, { headers: { "Authorization": token } })
        .then(respond => {
            const groupId = respond.data.respond.id;
            socket.emit('group-create',(groupId));
            window.location.href = './chat.html';
            
        })
        .catch(err => console.log(err));
}