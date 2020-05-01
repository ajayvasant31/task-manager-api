const Users = require('../models/Users')
const jwt = require('jsonwebtoken')


//Middleware
const auth = async (req, res, next) => {
    try {

        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = await jwt.verify(token, process.env.TOKEN_SECRET)
        const user = await Users.findOne({ '_id': decode._id, 'tokens.token': token })

        if (!user) {
            throw new Error('No user found')
        }
        req.user = user
        req.token = token

        next()
    }
    catch (err) {
        res.status(401).send('Invalid Authentication')
    }



}

module.exports = auth