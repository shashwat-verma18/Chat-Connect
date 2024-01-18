const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');

exports.addUser = async (req, res) => {

    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password,10);

    try{
        const user = await User.create({name, email, phone, password: hashedPassword});
        res.json({ "message": "User registered successfully !", check: true });
    }catch(err){
        res.json({ "message": "User already registered !", check: false })
    }

};

exports.loginUser = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try{
        const user = await User.findOne({where : {email}});

        if(!user){
            res.status(404).json({message : "User not found!", display : "User is not registered !"});
        }else{
            
            if(await bcrypt.compare(password, user.password)){
                res.status(200).json({message : "User Login Successfully !", token: generateToken(user.id, user.name), name: user.name});
            }
            
            else{
                res.status(401).json({message: "User not authorized", display : "Incorrect email or password"});
            }

        }

    }catch(err){
        console.log(err);
    }

}

exports.getAllUser = async (req, res) => {


    try{

        const admin = req.user.id;

        const users = await User.findAll({
            where:{
                id : {
                    [Sequelize.Op.not] : `${admin} `
                }
            }
        });

        if(!users){
            res.status(404).json({message : "User not found!", display : "User is not registered !"});
        }else{
            res.status(200).json({users});

        }

    }catch(err){
        console.log(err);
    }

}

function generateToken(id, name){
    return jwt.sign({userId: id, name: name},  process.env.TOKEN_SECRET);
}