import express from 'express';
import passport from 'passport';
import { 
    login, 
    signup, 
    logout
    // updatepfp, 
    // updateusername, 
    // googleAuthCallback, 
    // googleAuthFailure,
    // getUSerinfo 
} from '../controllers/authController.js';
import { checkLogin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Auth page");
});

router.post("/login", login);

router.post("/signup", signup);

router.post("/logout", logout);

// Protected route to check authentication
router.get("/check", checkLogin, (req, res) => {
    try {
        res.status(200).json({
            message: "User is authenticated",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// router.put("/updatepfp", checkLogin, updatepfp);

// router.put("/updateuname", checkLogin, updateusername);

// // Google OAuth routes
// router.get('/google', 
//     passport.authenticate('google', { 
//         scope: ['profile', 'email'],
//         session: false
//     })
// );

// router.get('/google/callback', 
//     passport.authenticate('google', { 
//         failureRedirect: '/api/auth/google/failure',
//         session: false 
//     }),
//     googleAuthCallback
// );

// router.get('/google/failure', googleAuthFailure);

// router.post('/userinfo', checkLogin, getUSerinfo);

// router.get("/check", checkLogin, (req, res) => {
//     try {
//         res.status(200).json(req.user);
//     } catch (error) {
//         console.log(error);
//     }
// });

export default router;