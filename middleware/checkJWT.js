const jwt = require('jsonwebtoken');

// Check JWT and make user data available for all routes
const checkJWT = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            // Make user available to all templates without using locals
            res.app.locals.user = decoded;
        } catch (error) {
            res.clearCookie('jwt');
            req.user = null;
            res.app.locals.user = null;
        }
    } else {
        req.user = null;
        res.app.locals.user = null;
    }
    
    next();
};

module.exports = checkJWT;