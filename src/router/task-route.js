const express = require('express')
const Tasks = require('../models/Tasks')
const auth = require('../middleware/auth')

const route = express.Router()

route.post('/tasks', auth, async (req, res) => {

    const task = new Tasks({
        ...req.body,
        owner: req.user._id
    })

    try {
        const result = await task.save()
        res.status(201).send(result)

    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }

})


route.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    }

    catch (err) {
        res.status(404).send(err)
    }

})

route.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id
    try {
        const result = await Tasks.findOne({ _id, 'owner': req.user._id })

        //OR
        // await req.user.populate('tasks').excPopulate()
        //  res.send(req.user.tasks)
        if (!result) {

            return res.status(404).send({ err: 'Task not found' })

        }
        else {
            res.send(result)
        }
    }

    catch (err) {

        res.status(500).send(err)
    }

})

route.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isvalidUpdate = updates.every((item) => allowedUpdates.includes(item))

    if (!isvalidUpdate) {
        return res.status(400).send({ err: 'Invalid field' })
    }
    try {
        const task = await Tasks.findOne({ '_id': req.params.id, 'owner': req.user._id })
        if (!task) {
            return res.status(404).send('Task not found')
        }
        //   await Tasks.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()

        res.status(201).send(task)
    }
    catch (err) {
        res.status(500).send(err)
    }


})

route.delete('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id
    try {

        const task = await Tasks.findOneAndDelete({ _id, 'owner': req.user._id })
        if (!task) {
            return res.status(404).send('Task not found')
        }
        res.status(200).send("Task deleted successfully")

    }
    catch (err) {
        res.status(500).send(err)
    }

})

module.exports = route