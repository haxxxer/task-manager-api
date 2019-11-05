require('./db/mongoose');

const express = require('express');
const userRoutes = require('./routes/user.route');
const taskRoutes = require('./routes/task.route');

const app = express();
const port = process.env.PORT; 

app.use(express.json());
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

app.listen(port, ()=> {
  console.log('Server has started on port ' + port);
});