const User=require('../models/user')
const shortId=require('shortid')
const jwt=require('jsonwebtoken')
const expressJwt=require('express-jwt')
const Blog=require('../models/blog')
const fs = require('fs');
const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash');
const sgMail = require('@sendgrid/mail'); // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.preSignup = (req, res) => {
    const { name, email, password } = req.body;
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account activation link`,
            html: `
            <p>Please use the following link to activate your acccount:</p>
            <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>
        `
        };

        sgMail.send(emailData).then(sent => {
            return res.json({
                message: `Email has been sent to ${email}. Follow the instructions to activate your account.`
            });
        });
    });
};

exports.signup = (req, res) => {
    const token = req.body.token;
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Signup again'
                });
            }

            const { name, email, password } = jwt.decode(token);

            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;

            const user = new User({ name, email, password, profile, username });
            user.photo.data=fs.readFileSync('./profile.png');
            user.photo.contentType = "image/png"
            user.save((err, user) => {
                if (err) {
                    return res.status(401).json({
                        error: errorHandler(err)
                    });
                }
                return res.json({
                    message: 'Singup success! Please signin'
                });
            });
        });
    } else {
        return res.json({
            message: 'Something went wrong. Try again'
        });
    }
};

// exports.signup=(req,res)=>{

//     User.findOne({email:req.body.email}).exec((err,user)=>{
//         if(user)
//         {
//             res.status(400).json({error:'Email is taken'})
//         }
//         else{
//             let username=shortId.generate()
//             let profile=`${process.env.CLIENT_URL}/profile/${username}`
//             let newuser=new User({
//                 name:req.body.name,
//                 email:req.body.email,
//                 password:req.body.password,
//                 username,
//                 profile
//             })
//             newuser.photo.data=fs.readFileSync('./profile.png');
//             newuser.photo.contentType = "image/png"
//             console.log(newuser)
//             newuser.save((err,success)=>{
//                 if(err)
//                 {
//                     res.send(400).json({
//                         error:err
//                     })
//                 }
//                 else{
//                     res.json({
//                         message:"User signed up successfully. Login to continue"
//                     })
//                 }
//             })
//         }

//     })
// }

exports.signin=(req,res)=>{

    User.findOne({email:req.body.email}).exec((err,user)=>{
        if(err || !user)
        {
            return res.status(404).json({
                error:"User with given email dosent exist. Please signup"
            })
        }
        if(!user.authenticate(req.body.password))
        {
            return res.status(400).json({
                error:"Email and password dont match"
            })
        }

        const token=jwt.sign({_id:user._id},process.env.JWT_secret,{expiresIn:'1d'})

        res.cookie('token',token,{expiresIn:'1d'})

        res.status(200).json({
            token,
            user:{
                _id:user._id,
                name:user.name,
                username:user.username,
                email:user.email,
                role:user.role,
                profile:user.profile
            }
    })
    })
}

exports.signout=(req,res)=>{
    res.clearCookie('token')
    res.json({
        message:"Signout successfull"
    })
}

exports.requireSignin=expressJwt({
    secret:process.env.JWT_secret
})

exports.authMiddleware=(req,res,next)=>{
    const userid=req.user._id
    User.findOne({_id:userid}).exec((err,user)=>{
        if(err || !user)
        {
            return res.status(404).json({
                error:"User not found"
            })
        }
        else{
            req.profile=user
            next()
        }
    })
}

exports.adminMiddleware=(req,res,next)=>{
    const userid=req.user._id
    User.findOne({_id:userid}).exec((err,user)=>{
        if(err || !user)
        {
            return res.status(400).json({
                error:"User not found"
            })
        }
        
        if(user.role!=1)
        {
            return res.status(400).json({
                error:"Admin resource. Access denied"
            })
        }
            req.profile=user
            next()
    
    })
}

exports.canUpdateDeleteBlog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'You are not authorized'
            });
        }
        next();
    });
};

exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: 'User with that email does not exist'
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

        // email
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password reset link`,
            html: `
            <p>Please use the following link to reset your password:</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>
        `
        };
        // populating the db > user > resetPasswordLink
        user.ResetPasswordLink=token;
        user.save((err,result)=>{
            if(err)
            {
                return res.json({ error: errorHandler(err) });
            }
            else {
                sgMail.send(emailData).then(sent => {
                    return res.json({
                        message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10min.`
                    });
                });
            }

        })
        // return user.updateOne({ resetPasswordLink: token }, (err, success) => {
        //     if (err) {
        //         return res.json({ error: errorHandler(err) });
        //     } else {
        //         sgMail.send(emailData).then(sent => {
        //             return res.json({
        //                 message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10min.`
        //             });
        //         });
        //     }
        // });
    });
};

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Try again'
                });
            }
            console.log(resetPasswordLink)
            User.findOne({ ResetPasswordLink:resetPasswordLink }, (err, user) => {
                console.log(user)
                console.log(err)
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Something went wrong. Try later'
                    });
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json({
                        message: `Great! Now you can login with your new password`
                    });
                });
            });
        });
    }
};