const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		let token = null;

		if (authHeader && authHeader.startsWith('Bearer ')) {
			token = authHeader.split(' ')[1];
		} else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}
		

		if (!token) {
			return res.status(401).json({ success: false, message: 'No token provided' });
		}

		if (!process.env.JWT_SECRET) {
			return res.status(500).json({ success: false, message: 'Server misconfiguration: JWT_SECRET not set' });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			if (err && err.name === 'TokenExpiredError') {
				return res.status(401).json({ success: false, message: 'Token expired' });
			}
			if (err && (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError')) {
				return res.status(401).json({ success: false, message: 'Invalid token' });
			}
			return res.status(401).json({ success: false, message: 'Token verification failed' });
		}

		// attach full user object (without password) if exists
		const user = await User.findById(decoded.id).select('-password');
		if (!user) {
			return res.status(401).json({ success: false, message: 'User not found' });
		}

		req.user = user;
		next();
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.isStudent = (req, res, next) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
	if (req.user.accountType !== 'Student') return res.status(403).json({ success: false, message: 'Forbidden: Students only' });
	next();
};

exports.isInstructor = (req, res, next) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
	if (req.user.accountType !== 'Instructor') return res.status(403).json({ success: false, message: 'Forbidden: Instructors only' });
	next();
};

exports.isAdmin = (req, res, next) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
	if (req.user.accountType !== 'Admin') return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
	next();
};
