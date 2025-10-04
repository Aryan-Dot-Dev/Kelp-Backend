import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { verifyAuth, verifyCR } from '../middleware/cr.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// CREATE - Only CR can create exams
router.post('/create', verifyCR, async (req, res) => {
    try {
        const { title, date, type } = req.body;
        const createdById = req.user.id; // From middleware

        // Validation
        if (!title || !date) {
            return res.status(400).json({ 
                error: 'Title and date are required.' 
            });
        }

        // Create exam
        const exam = await prisma.exam.create({
            data: {
                title,
                date: new Date(date),
                type: type || 'MIDSEM',
                createdById
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            exam
        });

    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ 
            error: 'Failed to create exam',
            details: error.message 
        });
    }
});

// UPDATE - Only CR can update exams
router.put('/:id', verifyCR, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, type } = req.body;

        // Check if exam exists
        const existingExam = await prisma.exam.findUnique({
            where: { id }
        });

        if (!existingExam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Update exam
        const updatedExam = await prisma.exam.update({
            where: { id },
            data: {
                title: title || existingExam.title,
                date: date ? new Date(date) : existingExam.date,
                type: type || existingExam.type
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Exam updated successfully',
            exam: updatedExam
        });

    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({ 
            error: 'Failed to update exam',
            details: error.message 
        });
    }
});

// DELETE - Only CR can delete exams
router.delete('/:id', verifyCR, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if exam exists
        const existingExam = await prisma.exam.findUnique({
            where: { id }
        });

        if (!existingExam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Delete exam
        await prisma.exam.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Exam deleted successfully'
        });

    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({ 
            error: 'Failed to delete exam',
            details: error.message 
        });
    }
});

// GET ALL - All authenticated users can view exams
router.get('/list', verifyAuth, async (req, res) => {
    try {
        const exams = await prisma.exam.findMany({
            orderBy: { date: 'asc' },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.json({
            success: true,
            count: exams.length,
            exams
        });

    } catch (error) {
        console.error('Fetch exams error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch exams',
            details: error.message 
        });
    }
});

// GET UPCOMING - All authenticated users can view upcoming exams
router.get('/upcoming', verifyAuth, async (req, res) => {
    try {
        const now = new Date();

        const upcomingExams = await prisma.exam.findMany({
            where: {
                date: {
                    gte: now
                }
            },
            orderBy: { date: 'asc' },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.json({
            success: true,
            count: upcomingExams.length,
            exams: upcomingExams
        });

    } catch (error) {
        console.error('Fetch upcoming exams error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch upcoming exams',
            details: error.message 
        });
    }
});

// GET BY ID - All authenticated users can view a specific exam
router.get('/:id', verifyAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await prisma.exam.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json({
            success: true,
            exam
        });

    } catch (error) {
        console.error('Fetch exam error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch exam',
            details: error.message 
        });
    }
});

export default router;