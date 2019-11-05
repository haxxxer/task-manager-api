const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/task-manager-api', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

