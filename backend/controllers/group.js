const Group = require('../models/groupModel');
const userGroup = require('../models/userGroupModel');
const User = require('../models/userModel');


exports.createGrp = async (req, res) => {
    try{

        const {groupName, users} = req.body;

        users.unshift(req.user.id);
        
        const respond = await Group.create({name: groupName});

        for(let i=0;i<users.length;i++){
            var isAdmin = false;
            if(i===0)
                isAdmin = true;
            const response = await userGroup.create({userId : users[i], groupId : respond.id, isAdmin : isAdmin});
        }

        res.status(200).json({respond});
    }catch(err){
        console.log(err);
    }
    
}

exports.getGrp = async (req,res) => {
    try{
        const id = req.user.id;

        const userGroups = await req.user.getGroups({
            attributes: ['id', 'name']
        });
        
        res.status(200).json({userGroups});

    }catch(err){
        console.log(err);
    }
    
}

exports.getMembers = async(req, res) => {
    try{
        const grpId = req.query.grpId;

        const users = await Group.findByPk(grpId, {
            include: [
                {
                    model: User,
                    through: {
                        model: userGroup,
                        attributes: ['isAdmin']
                    },
                    attributes: ['id', 'name']
                }
            ]
        });


        res.status(200).json({users});
    }catch(err){
        console.log(err);
    }
}

exports.makeAdmin = async(req, res) => {
    try{
        const {userId, groupId} = req.body;

        const respond = await userGroup.update({isAdmin: '1'},{
            where:{
                userId : userId,
                groupId: groupId
            }
        });

        res.status(200).json({respond});

    }catch(err){
        console.log(err);
    }
}

exports.removeUser = async(req, res) => {
    try{
        const {userId, groupId} = req.body;

        const respond = await userGroup.destroy({
            where:{
                userId : userId,
                groupId: groupId
            }
        });

        res.status(200).json({respond});

    }catch(err){
        console.log(err);
    }
} 