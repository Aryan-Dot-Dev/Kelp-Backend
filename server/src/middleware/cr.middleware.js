import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const verifyCR = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from database to verify role
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ 
                error: 'User not found.' 
            });
        }

        // Check if user has CR role
        if (user.role !== 'CR') {
            return res.status(403).json({ 
                error: 'Access denied. Only CR (Class Representative) can perform this action.' 
            });
        }

        // Attach user info to request object for use in route handlers
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired. Please login again.' 
            });
        }
        
        console.error('CR verification error:', error);
        return res.status(500).json({ 
            error: 'Internal server error during authentication.' 
        });
    }
};

// Optional: Middleware to verify CR or Teacher (for read-only access)
export const verifyCRorTeacher = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ 
                error: 'User not found.' 
            });
        }

        if (user.role !== 'CR' && user.role !== 'TEACHER') {
            return res.status(403).json({ 
                error: 'Access denied. Only CR or Teacher can perform this action.' 
            });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        
        console.error('CR/Teacher verification error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// Middleware to verify any authenticated user (for read operations)
export const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ 
                error: 'User not found.' 
            });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        
        console.error('Auth verification error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
