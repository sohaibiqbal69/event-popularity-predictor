const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ensureAuthenticated = (req, res, next) => {
    console.log('\nAuth middleware: Starting authentication check...');
    console.log('Auth middleware: JWT_SECRET is', process.env.JWT_SECRET ? 'defined' : 'undefined');
    console.log('Auth middleware: JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    const authHeader = req.headers['authorization'];
    console.log('Auth middleware: Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if(!authHeader) {
        console.log('Auth middleware: No authorization header, returning 403');
        return res.status(403)
        .json({ message: "unauthorized, JWT Token is required "});
    }
    
    // Check if the token is in Bearer format
    const parts = authHeader.split(' ');
    console.log('Auth middleware: Authorization parts:', parts);
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.log('Auth middleware: Invalid Bearer format, returning 403');
        return res.status(403)
        .json({ message: "unauthorized, JWT Token must be in Bearer format"});
    }
    
    const token = parts[1];
    console.log('Auth middleware: Token extracted:', token.substring(0, 10) + '...');
    
    try {
        if (!process.env.JWT_SECRET) {
            console.error('Auth middleware: JWT_SECRET is not defined in environment variables');
            console.error('Auth middleware: Current working directory:', process.cwd());
            console.error('Auth middleware: __dirname:', __dirname);
            return res.status(500).json({ message: "Server configuration error" });
        }
        
        console.log('Auth middleware: Attempting to verify token...');
        console.log('Auth middleware: Using JWT_SECRET:', process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth middleware: Token verified successfully, decoded:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth middleware: Token verification failed:', err.message);
        console.error('Auth middleware: Full error:', err);
        return res.status(403)
        .json({ message: "unauthorized, JWT Token is wrong or expired"});
    }
}

module.exports = ensureAuthenticated;