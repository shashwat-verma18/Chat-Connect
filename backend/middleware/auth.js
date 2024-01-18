const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = (req, res, next) => {

    try{
        const token = req.header('Authorization');
        
        const userToken = jwt.verify(token, process.env.TOKEN_SECRET);
        
        User.findByPk(userToken.userId)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => console.log(err));
    }catch(err){
        console.log(err);
    }
}

module.exports = {authenticate};