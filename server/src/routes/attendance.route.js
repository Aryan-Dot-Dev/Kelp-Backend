import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

router.post('/sync', async (req, res) => {
    try {
        const { rollNumber, tables } = req.body;

        // Validation
        if (!rollNumber || !tables || !Array.isArray(tables) || tables.length === 0) {
            return res.status(400).json({ error: 'Roll number and tables are required' });
        }

        // Extract the data table (skip header row)
        const dataTable = tables[0];
        const rows = dataTable.slice(1); // Skip header row
        
        // Separate course rows from total row
        const courseRows = rows.filter(row => row[0] !== 'Total Percentage');
        const totalRow = rows.find(row => row[0] === 'Total Percentage');

        if (!totalRow) {
            return res.status(400).json({ error: 'Total percentage row not found' });
        }

        // Parse total attendance
        const totalMatch = totalRow[1].match(/(\d+)\/(\d+)/);
        const totalAttended = parseInt(totalMatch[1]);
        const totalDelivered = parseInt(totalMatch[2]);
        const totalPercentage = parseFloat(totalRow[2].replace('%', ''));

        // Find user by ID (rollNumber is actually User.id)
        const user = await prisma.user.findUnique({
            where: { id: rollNumber }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const studentAttendanceId = `ATT_${user.id}_${Date.now()}`;

        // Upsert StudentAttendance
        const studentAttendance = await prisma.studentAttendance.upsert({
            where: { userId: user.id },
            update: {
                totalAttended,
                totalDelivered,
                totalPercentage,
                lastScraped: new Date(),
                updatedAt: new Date()
            },
            create: {
                id: studentAttendanceId,
                userId: user.id,
                totalAttended,
                totalDelivered,
                totalPercentage,
                lastScraped: new Date(),
                updatedAt: new Date()
            }
        });

        // Delete old course attendance records for this student
        await prisma.courseAttendance.deleteMany({
            where: { studentAttendanceId: studentAttendance.id }
        });

        // Insert new course attendance records
        const courseAttendanceRecords = courseRows.map((row, index) => {
            const [srNo, courseName, courseShortName, courseCode, attendedDelivered, percentage] = row;
            
            // Parse attended/delivered
            const match = attendedDelivered.match(/(\d+)\/(\d+)/);
            const attended = parseInt(match[1]);
            const delivered = parseInt(match[2]);
            const percentValue = parseFloat(percentage);

            return {
                id: `COURSE_${studentAttendance.id}_${courseCode}_${Date.now()}_${index}`,
                studentAttendanceId: studentAttendance.id,
                srNo: parseInt(srNo),
                courseName: courseName.trim(),
                courseShortName: courseShortName.trim(),
                courseCode: courseCode.trim(),
                attended,
                delivered,
                percentage: percentValue,
                scrapedAt: new Date()
            };
        });

        // Bulk insert course attendance
        await prisma.courseAttendance.createMany({
            data: courseAttendanceRecords,
            skipDuplicates: true
        });

        res.json({
            success: true,
            message: 'Attendance synced successfully',
            data: {
                studentAttendance,
                coursesCount: courseAttendanceRecords.length,
                overall: {
                    attended: totalAttended,
                    delivered: totalDelivered,
                    percentage: totalPercentage
                }
            }
        });

    } catch (error) {
        console.error('Attendance sync error:', error);
        res.status(500).json({ 
            error: 'Failed to sync attendance',
            details: error.message 
        });
    }
});

// Get attendance for a user by User ID
router.get('/student/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const attendance = await prisma.studentAttendance.findUnique({
            where: { userId },
            include: {
                CourseAttendance: {
                    orderBy: { srNo: 'asc' }
                }
            }
        });

        if (!attendance) {
            return res.status(404).json({ error: 'No attendance data found' });
        }

        res.json({
            success: true,
            data: attendance
        });

    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// Get latest sync info
router.get('/latest/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const attendance = await prisma.studentAttendance.findUnique({
            where: { userId },
            select: {
                lastScraped: true,
                totalPercentage: true,
                totalAttended: true,
                totalDelivered: true
            }
        });

        res.json({
            success: true,
            data: attendance
        });

    } catch (error) {
        console.error('Error fetching latest sync:', error);
        res.status(500).json({ error: 'Failed to fetch latest sync' });
    }
});

export default router;