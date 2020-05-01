const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    }
}, { timestamps: true })

TaskSchema.pre('save', async function (next) {
    const task = this
    next()
})

const Tasks = mongoose.model('Tasks', TaskSchema)

module.exports = Tasks