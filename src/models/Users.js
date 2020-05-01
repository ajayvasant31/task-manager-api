const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./Tasks')
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error('Age cannot be negative')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email')
            }
        }
    },
    password: {
        type: String,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.includes("password")) {
                throw new Error("Password conditions didn't match")
            }
        }
    },
    avatar: {
        type: Buffer
    }
    ,
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},
    {
        timestamps: true

    })

UserSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})


UserSchema.statics.findByCredentials = async (email, password) => {

    const user = await Users.findOne({ email })
    if (!user) {
        throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
        throw new Error('Invalid credentials')
    }

    return user

}

UserSchema.methods.generateToken = async function () {

    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.TOKEN_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token




}


UserSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10)
    }

    next()
})

UserSchema.methods.toJSON = function () {

    const user = this
    const UserObj = user.toObject()

    delete UserObj.password
    delete UserObj.tokens
    delete UserObj.avatar
    // console.log(UserObj)
    return UserObj

}

UserSchema.pre('remove', async function (next) {
    const user = this
    await Tasks.deleteMany({ 'owner': user._id })
    next()

})

const Users = mongoose.model('Users', UserSchema)

module.exports = Users