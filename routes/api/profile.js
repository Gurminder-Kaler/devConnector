const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const profile = require('../../models/Profile')
const user = require('../../models/User')
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

router.get('/test', (req, res) => res.json(
    {
        msg: "Profile Route Works"
    }
));

//@route GET api/profile
//@desc get current user profile
//@access Private
router.get('/',
passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id})
    .populate('user', ['name', 'avatar'])
    .then( profile => {
        if(!profile){
            errors.noprofile = "This is no profile for this user";
            return res.status(404).json(errors)
        } else {
            res.json(profile);
        }
    })
    .catch( err => res.status(404).json(err))
});

//@route GET api/profile/handle/:handle
//@desc get current user profile by handle
//@access Public
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle})
    .populate('user', ['name', 'avatar'])
    .then( profile => {
        if(!profile){
            errors.noprofile = "This is no profile with this handle";
            return res.status(404).json(errors)
        } else {
            res.json(profile);
        }
    })
    .catch( err => res.status(404).json(err))
});
//@route GET api/profile/user/:user_id
//@desc get current user profile by user_id
//@access Public
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id})
    .populate('user', ['name', 'avatar'])
    .then( profile => {
        if(!profile){
            errors.noprofile = "This is no profile with this id";
            return res.status(404).json(errors)
        } else {
            res.json(profile);
        }
    })
    .catch( err => res.status(404).json({profile: 'There is no profile for this id'}))
});

//@route GET api/profile/all
//@desc get all user profiles
//@access Public
router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then( profile => {
        if(!profile){
            errors.noprofile = "This is no profile with this id";
            return res.status(404).json(errors)
        } else {
            res.json(profile);
        }
    })
    .catch( err => res.status(404).json({profile: 'There is no profiles in the Database'}))
});

//@route POST api/profile
//@desc create or edit user profile
//@access Private
router.post('/',
passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateProfileInput(req.body);
    if(!isValid) {
        return res.status(400).json({
            errors
        });
    }
    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) {
        profileFields.handle = req.body.handle;
    }
    if(req.body.company) {
        profileFields.company = req.body.company;
    }
    if(req.body.website) {
        profileFields.website = req.body.website;
    }
    if(req.body.location) {
        profileFields.location = req.body.location;
    }
    if(req.body.bio) {
        profileFields.bio = req.body.bio;
    }
    if(req.body.status) {
        profileFields.status = req.body.status;
    }
    if(req.body.githubusername) {
        profileFields.githubusername = req.body.githubusername;
    }
    //skills
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    //social
    profileFields.social = {};
    if(req.body.youtube) {
        profileFields.social.youtube = req.body.youtube;
    }
    if(req.body.twitter) {
        profileFields.social.twitter = req.body.twitter;
    }
    if(req.body.linkedin) {
        profileFields.social.linkedin = req.body.linkedin;
    }
    if(req.body.instagram) {
        profileFields.social.instagram = req.body.instagram;
    } 1

    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile) {
            //Update
            Profile.findOneAndUpdate(
                {
                    user: req.user.id
                },
                {
                    $set: profileFields
                },
                {
                    new : true
                }
            )
            .then(profile => res.json(profile))
        } else {
            //check if handle exists
            Profile.findOne({
                handle: profileFields.handle
            }).then(profile => {
                if(profile) {
                    errors.handle = 'That handle is already taken';
                    res.status(400).json(errors);
                }
                new Profile(profileFields).save().then(profile => res.json(profile));
            })
        }
    })
});


//@route POST api/profile/experience
//@desc create or edit user experience
//@access Private
router.post('/experience', passport.authenticate('jwt', {session :false}), (req, res)  => {
    const {errors, isValid} = validateExperienceInput(req.body);
    if(!isValid) {
        return res.status(400).json({
            errors
        });
    }
    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newExp  = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }
        //Add to exp array
        profile.experience.unshift(newExp);
        profile.save().then(profile => res.json(profile));
    });
});

//@route POST api/profile/education
//@desc create or edit user education
//@access Private
router.post('/education', passport.authenticate('jwt', {session :false}), (req, res)  => {
    const {errors, isValid} = validateEducationInput(req.body);
    if(!isValid) {
        return res.status(400).json({
            errors
        });
    }
    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newEdu  = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }
        //Add to exp array
        profile.education.unshift(newEdu);
        profile.save().then(profile => res.json(profile));
    });
});
module.exports = router ;

//@route DELETE api/profile/education/:exp_id
//@desc delete experience from profile
//@access Private
router.post('/education', passport.authenticate('jwt', {session :false}), (req, res)  => {
    const {errors, isValid} = validateEducationInput(req.body);
    if(!isValid) {
        return res.status(400).json({
            errors
        });
    }
    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newEdu  = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }
        //Add to exp array
        profile.education.unshift(newEdu);
        profile.save().then(profile => res.json(profile));
    });
});
module.exports = router ;