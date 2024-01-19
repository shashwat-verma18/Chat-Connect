const Sequelize = require('sequelize');
const Message = require('../models/messageModel.js');
const User = require('../models/userModel.js');
const AWS = require('aws-sdk');
const ArchivedMessage = require('../models/archivedMessage.js');

exports.sendMsg = async (req, res) => {

    
    const userId = req.user.id;
    const msg = req.body.msg;
    var grpId = req.query.grpId;

    if(grpId==='-1')
        grpId=null;

    try{
        const respond = await Message.create({message : msg, userId, groupId: grpId});

        let response = {
            id : respond.id,
            message : respond.message,
            user : {name : req.user.name}
        }

        res.status(200).json(response);

    }catch(err){
        console.log('sendMsg : '+err);
    }
}

exports.getMsg = async (req, res) => {

    try{
        const lastId = req.query.id;
        var grpId = req.query.grpId;
        if(grpId==='-1')
            grpId=null;

        const respond = await Message.findAll({
            where : {id : {
                [Sequelize.Op.gt] : lastId
            },
                groupId: grpId,
            },
            attributes: ['id','message'],
            include: [{
                model: User,
                attributes: ['name']
            }],
            order: [['createdAt','DESC']],
            limit:10
        });

        if(respond.length===0){
            const response = await ArchivedMessage.findAll({
                where : {id : {
                    [Sequelize.Op.gt] : lastId
                },
                    groupId: grpId,
                },
                attributes: ['id','message'],
                include: [{
                    model: User,
                    attributes: ['name']
                }],
                order: [['createdAt','DESC']],
                limit:10
            });

            res.status(200).json(response);
        }

        res.status(200).json(respond);
        
    }catch(err){
        console.log('getMsg : '+err);
    }
}

exports.getAllMsg = async (req, res) => {

    try{
        var grpId = req.query.grpId;
        const user = req.user.id;

        if(grpId==='-1')
            grpId=null;

        const respond = await Message.findAll({
            where: {
                groupId: grpId,
            },
            attributes: ['id','message'],
            include: [{
                model: User,
                attributes: ['name']
            }],
        });

        const respond2 = await ArchivedMessage.findAll({
            where: {
                groupId: grpId,
            },
            attributes: ['id','message'],
            include: [{
                model: User,
                attributes: ['name']
            }],
        });

        


        res.status(200).json({res1 : respond, res2: respond2});
        
    }catch(err){
        console.log('getMsg : '+err);
    }
}

exports.sendFile = async(req, res) => {
    try{
        const file = req.file;

        const userId = req.user.id;
        const groupId = req.query.grpId;

        if(groupId==='-1')
            groupId=null;

        let fileUrl = "";

        if(file){
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().slice(0, 10); 
            const formattedTime = currentDate.toISOString().slice(11, 19).replace(/:/g, ''); 
                
            const filename = `${formattedDate}_${formattedTime}_${file.originalname}`;
                
            const buffer = file.buffer;
            fileUrl = await uploadToS3(filename, buffer);    
            // console.log(fileUrl);
        }

        const respond = await Message.create({message : fileUrl, userId, groupId});

        let response = {
            id : respond.id,
            message : respond.message,
            user : {name : req.user.name}
        }

        res.status(200).json(response);

    }catch(err){
        console.log(err);
    }
}

function uploadToS3(fileName, data){
    try{
        const BUCKET_NAME = process.env.BUCKET_NAME;
        const IAM_USER_KEY = process.env.IAM_USER_KEY;
        const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

        let s3bucket = new AWS.S3({
            accessKeyId: process.env.IAM_USER_KEY,
            secretAccessKey: process.env.IAM_USER_SECRET,
        });

        var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body: data,
            ACL: 'public-read'
        }

        return new Promise((resolve, reject) => {
            s3bucket.upload(params, (err, s3response) => {
                if(err){
                    console.log("Something went wrong ",err);
                    reject(err);
                }else{
                    console.log('success ',s3response);
                    resolve(s3response.Location);
                }
            })
        });
    }catch(err){
        console.log(err);
    }
    
}