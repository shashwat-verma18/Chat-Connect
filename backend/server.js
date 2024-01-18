const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIO = require('socket.io');

const bodyParser = require('body-parser');

const sequelize = require('./util/database');

const app = express();

dotenv.config();

app.use(cors({ origin: "*" }));

//scoket.io
const server = require('http').createServer(app);  
const io = socketIO(server, {
    cors:{
        origin: "*"
    }
});

io.on('connection', socket => {
    // console.log('socket id  : '+socket.id);

    socket.on('send-message',(data)=>{
        io.emit('receive-message',data);
    });

    socket.on('group-create',data=>{
        io.emit('display-group',data)
    });

    socket.on('make-admin',data=>{
        io.emit('display-members',data)
    });

    socket.on('remove-user',data=>{
        io.emit('display-members',data)
    });


})

//table association
const User = require('./models/userModel');
const Message = require('./models/messageModel');
const Group = require('./models/groupModel');
const UserGroup = require('./models/userGroupModel');

const userRoute = require('./routes/userRoutes');
const msgRoute = require('./routes/messageRoute');
const groupRoute = require('./routes/groupRoute');



app.use(bodyParser.json({ extended: false }));

User.hasMany(Message);
Message.belongsTo(User, { constraints: true, onDelete: 'CASCADE', foreignKey: 'userId' });

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

UserGroup.belongsTo(User, { foreignKey: 'userId'});
Group.belongsTo(UserGroup, { foreignKey: 'groupId'});

Group.hasMany(Message);
Message.belongsTo(Group);

app.use('/users', userRoute);
app.use('/message', msgRoute);
app.use('/group', groupRoute);

sequelize
.sync()
.then(result => {
    server.listen(3000);
})
.catch(err => console.log(err));