const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');


const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


//@route GET api/users/test
//@desc Tests users routes
//@access Public
router.get('/test', (req, res) => res.json(
    {
        msg: "Users Route Works"
    }
));

//@route GET api/users/register
//@desc register user
//@access Public
router.post('/register', (req, res) =>  {
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json({
            errors
        });
    }

    User.findOne({
        email : req.body.email
    }).then(user => {
        if(user){
            return res.status(400).json({
                'email': 'Email Already Taken'
            })
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: '200',// Size 200 px,
                r: 'pg',// Rating
                d: 'mm',// Default
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password,
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                });
            });
        }
    })
});

//@route GET api/users/login
//@desc login user
//@access Public
router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body);
    if(!isValid) {
        return res.status(400).json({
            errors 
        });
    }

    const email = req.body.email;
    const password = req.body.password;
    //Find user by email
    const user = User.findOne({email: email})
    .then(user => {
        if(!user) {
            errors.email = "User Not Found";
            return res.status(404).json(errors);
        }
        //check Password
        bcrypt.compare(password, user.password).then(isMatch => {
            if(isMatch) {
                const payload = { id: user.id, name: user.name, avatar: user.avatar}
                jwt.sign(payload, keys.secretOrKey, {expiresIn: 3400}, (err, token) => {
                    res.json({
                        success:true,
                        token: 'Bearer '+token
                    })
                });
            } else {
                errors.password = "Password Incorrect";
                res.status(400).json(errors);
            }
        });
    });
});

//@route GET api/users/current
//@desc get current user login
//@access Public
router.get('/current',
passport.authenticate('jwt', {session: false}), (req,res) => {
    res.json({ msg: 'Success', data: {email: req.user.email,  name: req.user.name} });
});

module.exports = router ;