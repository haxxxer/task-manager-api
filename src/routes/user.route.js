const path = require('path')

const sharp = require ('sharp');
const multer = require('multer');

const router = require('express').Router();
const User = require('../models/user.model');
const auth = require('../middleware/auth');
const accountEmails = require('../emails/account');

const upload = multer({
  limits:{
    fileSize:1000000
  },
  fileFilter(req,file,cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('File must be a JPG, JPEG or PNG of max size 1MB'));
    } else {
      cb(undefined, true);
    }
    // cb(undefined, undefined);
  }
});

router.post('', async (req, res) => {

  const newUser = new User(req.body)
  try {
    const token = await newUser.generateToken();
    await newUser.save();
    accountEmails.sendWelcomeEmail(newUser.email, newUser.name);
    res.status(201).send({user: newUser, token});
  } catch (err) {
    res.status(400).send(err)
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateToken();
    
    res.send({user, token});
  } catch (err) {
    res.status(400).send({error: err.message});
  }
})


router.post('/logout', auth, async (req, res) => {
  try {
    console.log(req.user);
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send(err.message);
  }
})

router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});



router.patch('/me', auth, async (req, res) => {

  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age' ];
  const isValidOperation = updates.every(field => allowedUpdates.includes(field));

  if(!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates'});
  }


  try {

    const user = req.user;
    updates.forEach(update => user[update]= req.body[update]);
    
    await user.save();
    
    res.status(200).send(user);

  } catch (err) {
    res.status(500).send(err);
  }

});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({error:error.message});
})

router.delete('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/:id/avatar', async(req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!(user || user.avatar)) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
})
router.delete('/me', auth, async (req, res) => {

  try {
    await req.user.remove();
    accountEmails.sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);

  } catch (err) {
    res.status(500).send({err});
  }

});



module.exports = router;
