import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { studentMap } from "../../../utils/studentMapper.util.js";
import redisClient from "../config/redis.js";
import { sendOTPEmail } from "../services/email.service.js";

const router = Router();
const prisma = new PrismaClient();

// Step 1: Send OTP to email
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Generate and send OTP
        const otp = await sendOTPEmail(email);
        console.log(otp)
        
        // Store OTP in Redis with 10 minutes expiry (600 seconds)
        await redisClient.setEx(`otp:${email}`, 600, otp);
        
        console.log(`OTP sent to ${email}: ${otp}`); // For development only
        
        res.json({ message: 'OTP sent successfully to your email' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP email' });
    }
});

// Step 2: Verify OTP and Register User
router.post('/register', async (req, res) => {
    const { name: providedName, email, password, role = "STUDENT", otp } = req.body;
    
    if (!email || !password || !otp) {
        return res.status(400).json({ error: 'Email, password, and OTP are required' });
    }

    // Validate name for teachers
    if (role === 'TEACHER' && !providedName?.trim()) {
        return res.status(400).json({ error: 'Name is required for teacher registration' });
    }

    try {
        // Get OTP from Redis
        const storedOTP = await redisClient.get(`otp:${email}`);
        
        if (!storedOTP) {
            return res.status(400).json({ error: 'OTP expired or not found. Please request a new OTP.' });
        }
        
        if (storedOTP !== otp) {
            return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
        }
        
        // Delete OTP after successful verification
        await redisClient.del(`otp:${email}`);
        
        // Check if user already exists (double-check)
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashed = await bcrypt.hash(password, 10);
        const id = email.split('@')[0];
        
        // Determine name: use provided name for teachers, lookup for students
        let name;
        if (role === 'TEACHER') {
            name = providedName.trim();
        } else {
            name = studentMap.find(student => student.email === email)?.name || "Unknown";
        }
        
        // Create user
        const user = await prisma.user.create({
            data: { id, name, email, password: hashed, role }
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.status(201).json({ 
            message: 'Registration successful',
            token,
            user: { 
                id: user.id,
                name: user.name,
                email: user.email, 
                role: user.role 
            } 
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// Step 3: Resend OTP
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    try {
        // Check if there's an existing OTP (rate limiting)
        const existingOTP = await redisClient.get(`otp:${email}`);
        
        if (existingOTP) {
            const ttl = await redisClient.ttl(`otp:${email}`);
            return res.status(429).json({ 
                error: `Please wait ${ttl} seconds before requesting a new OTP` 
            });
        }
        
        // Generate new OTP
        const otp = await sendOTPEmail(email);
        
        // Store new OTP in Redis with 10 minutes expiry
        await redisClient.setEx(`otp:${email}`, 600, otp);
        
        console.log(`OTP resent to ${email}: ${otp}`); // For development only
        
        res.json({ message: 'OTP resent successfully to your email' });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.json({ 
            message: 'Login successful',
            token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

export default router;