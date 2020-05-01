const express = require('express')
const Users = require('../models/Users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelEmail } = require('../email-service/sendGrid.js')
const route = express.Router()
route.get('/users', auth, async (req, res) => {
    res.send(req.user)
})

route.post('/users', async (req, res) => {

    try {
        const user = new Users(req.body)
        const token = await user.generateToken()
        const result = await user.save()
        sendWelcomeEmail(user.name, user.email)
        if (!result) {
            res.status(400).send({ err: "Bad data" })

        }
        res.send({ result, token })
    }
    catch (err) {
        res.status(500).send(err)
    }

})


route.get('/users/:id', async (req, res) => {

    try {
        const _id = req.params.id
        const user = await Users.findById(_id)
        if (!user) {
            return res.status(404).send('No user found with that id')
        }
        res.send(user)
    }
    catch (err) {
        res.status(500).send(err)
    }

})

route.patch('/users/me', auth, async (req, res) => {

    try {
        const allowedUpdates = ['name', 'age', 'email', 'password']
        const updates = Object.keys(req.body)
        const isValidUpdate = updates.every((item) => allowedUpdates.includes(item))
        const _id = req.params.id
        if (!isValidUpdate) {
            return res.status(400).send("Invalid update")
        }

        //const user = await Users.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })


        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.status(201).send(req.user)
    }
    catch (err) {
        res.status(500).send(err)
    }


})


route.delete('/users/me', auth, async (req, res) => {

    try {

        req.user.remove()
        sendCancelEmail(req.user.name, req.user.email)
        res.send("User Deleted")

    }

    catch (err) {
        res.status(500).send(err)
    }


})

route.post('/users/login', async (req, res) => {

    try {

        const user = await Users.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()

        res.send({ user, token })

    }
    catch (err) {
        res.status(400).send(err)
    }



})


route.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send("Successfully logged out")

    }
    catch (err) {
        res.status(500).send(err)
    }


})

route.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send("Logged out of all sessions")
    }
    catch (err) {
        res.status(500).send(err)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Only jpg,jpeg,png files are allowed'))
        }
        cb(undefined, true)

    }
})

route.post('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("Avatar uploaded")

}, (err, req, res, next) => {

    res.status(400).send({ 'err': err.message })

})


route.delete('/users/me/avatar', auth, async (req, res) => {

    req.user.avatar = undefined
    await req.user.save()
    res.send("Avatar removed")

}, (err, req, res, next) => {

    res.status(400).send({ 'err': err.message })

})

route.get('/users/:id/avatar', async (req, res) => {

    const user = await Users.findById(req.params.id)
    if (!user || !user.avatar) {
        throw new Error('No avatar found')
    }
    res.set('Content-Type', 'image/jpeg')
    res.send(user.avatar)

}, (err, req, res, next) => {
    res.status(404).send(err.message)
})



module.exports = route