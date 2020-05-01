require('./db/mongoose')
const Tasks = require('./models/Tasks')
const express = require('express')
const tasksRoute = require('./router/task-route')
const usersRoute = require('./router/user-route')
const app = express()
const Users = require('./models/Users')
const port = process.env.PORT

app.use(express.json())
app.use(tasksRoute)
app.use(usersRoute)

app.listen(port, () => {
    console.log('Listening on port ' + port)
})


