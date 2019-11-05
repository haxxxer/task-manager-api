const router = require('express').Router();
const {ObjectId} = require('mongodb');

const Task = require('../models/task.model');
const auth = require('../middleware/auth')



router.post('', auth, async (req, res) => {
  const newTask = new Task({...req.body, owner: req.user._id});
  try {
    await newTask.save();
    res.status(201).send(newTask);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if(req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if(req.query.sortBy) {
    let sortQuery = req.query.sortBy.split(':');
    sort[sortQuery[0]] = (sortQuery[1] === 'desc' ? -1 : 1)
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
    }).execPopulate();
    res.send(req.user.tasks);
    // const tasks = await Task.find({owner: req.user._id});
    // res.status(200).send(tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:_id', auth, async (req, res) => {
  const {_id} = req.params;

  if(!ObjectId.isValid(_id)) {
    return res.status(400).send({error: 'Invalid ID!'})
  }

  try {
    const task = await Task.findOne({_id, owner: req.user._id});
    if(!task) return res.status(404).send('Task was not found!');
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/:_id', auth, async (req, res) => {
  const {_id} = req.params;
  if (!ObjectId.isValid(_id)) { return res.status(400).send({error: "Invalid ID!"}); }
  try {
    const updatedTask = await Task.findOneAndUpdate({_id, owner: req.user._id}, req.body, {new: true, runValidators: true});
    if(!updatedTask) { return res.status(404).send('Task was not found!'); }
    res.send(updatedTask);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/:_id', auth, async (req, res) => {

  const {_id} = req.params;

  if(!ObjectId.isValid(_id)) 
    { return res.status(400).send({error: 'Invalid ID!'}); }

  try {
    const deletedTask = await Task.findOneAndDelete({_id: req.params._id, owner: req.user._id});
    if(!deletedTask) 
      { return res.status(404).send({error: 'Task was not found!'}); }
    
    res.send(deletedTask);

  } catch (err) {
    res.status(500).send({err});
  }

});

module.exports = router;
