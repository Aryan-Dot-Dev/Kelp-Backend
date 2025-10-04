import { PrismaClient } from '@prisma/client';
import express from 'express';
import multer from 'multer';
import { verifyAuth, verifyCRorTeacher } from '../middleware/cr.middleware.js';
import fileioService from '../services/fileio.service.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Get all assignments (for students)
router.get('/list', verifyAuth, async (req, res) => {
    try {
        const assignments = await prisma.assignment.findMany({
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        submissions: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch assignments'
        });
    }
});

// Get upcoming assignments (due date >= now)
router.get('/upcoming', verifyAuth, async (req, res) => {
    try {
        const now = new Date();
        const assignments = await prisma.assignment.findMany({
            where: {
                dueDate: {
                    gte: now
                }
            },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        submissions: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        console.error('Error fetching upcoming assignments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch upcoming assignments'
        });
    }
});

// Get assignment by ID with submissions
router.get('/:id', verifyAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const assignment = await prisma.assignment.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                },
                submissions: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        submittedAt: 'desc'
                    }
                }
            }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        res.json({
            success: true,
            assignment
        });
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch assignment'
        });
    }
});

// Create new assignment (CR or Teacher only) with optional file upload
router.post('/create', verifyCRorTeacher, upload.single('file'), async (req, res) => {
    try {
        const { title, description, documentUrl, dueDate } = req.body;

        // Validate required fields
        if (!title || !description || !dueDate) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, and due date are required'
            });
        }

        let fileKey = null;
        let fileUrl = null;

        // Handle file upload if present
        if (req.file) {
            try {
                const uploadResult = await fileioService.uploadFile(
                    req.file.buffer,
                    req.file.originalname,
                    {
                        expires: '1y', // 1 year expiration
                        autoDelete: false
                    }
                );

                fileKey = uploadResult.key;
                fileUrl = uploadResult.link;
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to upload file: ' + uploadError.message
                });
            }
        }

        const assignment = await prisma.assignment.create({
            data: {
                title,
                description,
                documentUrl: documentUrl || null,
                fileKey,
                fileUrl,
                dueDate: new Date(dueDate),
                createdById: req.user.id
            },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Assignment created successfully',
            assignment
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create assignment'
        });
    }
});

// Update assignment (CR or Teacher only) with optional file upload
router.put('/:id', verifyCRorTeacher, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, documentUrl, dueDate } = req.body;

        // Check if assignment exists
        const existingAssignment = await prisma.assignment.findUnique({
            where: { id }
        });

        if (!existingAssignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        // Verify ownership (only creator can update)
        if (existingAssignment.createdById !== req.user.id && req.user.role !== 'TEACHER') {
            return res.status(403).json({
                success: false,
                error: 'You can only update assignments you created'
            });
        }

        let fileKey = existingAssignment.fileKey;
        let fileUrl = existingAssignment.fileUrl;

        // Handle new file upload if present
        if (req.file) {
            try {
                // Delete old file if exists
                if (existingAssignment.fileKey) {
                    await fileioService.deleteFile(existingAssignment.fileKey);
                }

                // Upload new file
                const uploadResult = await fileioService.uploadFile(
                    req.file.buffer,
                    req.file.originalname,
                    {
                        expires: '1y',
                        autoDelete: false
                    }
                );

                fileKey = uploadResult.key;
                fileUrl = uploadResult.link;
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to upload file: ' + uploadError.message
                });
            }
        }

        const assignment = await prisma.assignment.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(documentUrl !== undefined && { documentUrl }),
                ...(dueDate && { dueDate: new Date(dueDate) }),
                ...(fileKey && { fileKey }),
                ...(fileUrl && { fileUrl })
            },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Assignment updated successfully',
            assignment
        });
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update assignment'
        });
    }
});

// Delete assignment (CR or Teacher only)
router.delete('/:id', verifyCRorTeacher, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if assignment exists
        const existingAssignment = await prisma.assignment.findUnique({
            where: { id }
        });

        if (!existingAssignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        // Verify ownership (only creator can delete)
        if (existingAssignment.createdById !== req.user.id && req.user.role !== 'TEACHER') {
            return res.status(403).json({
                success: false,
                error: 'You can only delete assignments you created'
            });
        }

        await prisma.assignment.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete assignment'
        });
    }
});

// Submit assignment (Students only) with optional file upload
router.post('/:id/submit', verifyAuth, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { rollNumber, submissionUrl } = req.body;

        if (!rollNumber && !req.file) {
            return res.status(400).json({
                success: false,
                error: 'Roll number is required'
            });
        }

        // Check if assignment exists
        const assignment = await prisma.assignment.findUnique({
            where: { id }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        let fileKey = null;
        let fileUrl = null;

        // Handle file upload if present
        if (req.file) {
            try {
                const uploadResult = await fileioService.uploadFile(
                    req.file.buffer,
                    req.file.originalname,
                    {
                        expires: '1y',
                        autoDelete: false
                    }
                );

                fileKey = uploadResult.key;
                fileUrl = uploadResult.link;
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to upload file: ' + uploadError.message
                });
            }
        }

        // Check if already submitted
        const existingSubmission = await prisma.submission.findUnique({
            where: {
                assignmentId_userId: {
                    assignmentId: id,
                    userId: req.user.id
                }
            }
        });

        if (existingSubmission) {
            // Delete old file if new file uploaded
            if (req.file && existingSubmission.fileKey) {
                await fileioService.deleteFile(existingSubmission.fileKey);
            }

            // Update existing submission
            const submission = await prisma.submission.update({
                where: {
                    id: existingSubmission.id
                },
                data: {
                    rollNumber,
                    ...(submissionUrl && { submissionUrl }),
                    ...(fileKey && { fileKey }),
                    ...(fileUrl && { fileUrl }),
                    submittedAt: new Date()
                }
            });

            return res.json({
                success: true,
                message: 'Submission updated successfully',
                submission
            });
        }

        // Create new submission
        const submission = await prisma.submission.create({
            data: {
                rollNumber,
                submissionUrl: submissionUrl || null,
                fileKey,
                fileUrl,
                assignmentId: id,
                userId: req.user.id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Assignment submitted successfully',
            submission
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit assignment'
        });
    }
});

// Get all students' attendance (Teacher only)
router.get('/attendance/all', verifyCRorTeacher, async (req, res) => {
    try {
        const studentsAttendance = await prisma.studentAttendance.findMany({
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                CourseAttendance: {
                    orderBy: {
                        srNo: 'asc'
                    }
                }
            },
            orderBy: {
                totalPercentage: 'asc' // Show students with low attendance first
            }
        });

        res.json({
            success: true,
            students: studentsAttendance
        });
    } catch (error) {
        console.error('Error fetching students attendance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch students attendance'
        });
    }
});

// Get file metadata (check if file exists)
router.get('/file/:key/metadata', verifyAuth, async (req, res) => {
    try {
        const { key } = req.params;
        
        const metadata = await fileioService.getFileMetadata(key);
        
        res.json({
            success: metadata.success,
            metadata
        });
    } catch (error) {
        console.error('Error fetching file metadata:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch file metadata'
        });
    }
});

// Delete uploaded file (Teacher/CR only - for cleanup)
router.delete('/file/:key', verifyCRorTeacher, async (req, res) => {
    try {
        const { key } = req.params;
        
        const result = await fileioService.deleteFile(key);
        
        res.json({
            success: result.success,
            message: result.message || result.error
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete file'
        });
    }
});

export default router;
