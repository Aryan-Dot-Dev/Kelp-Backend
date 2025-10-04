const timetableUtil = [
    {
        day: 'Monday',
        subjects: [
            {
                time: '9:10 AM - 10:00 AM',
                name: '-',
                location: '-',
                teacher: '-'
            },
            {
                time: '10:05 AM - 10:55 AM',
                name: 'Theory of Computation',
                location: 'B-215',
                teacher: 'Mrs Megha Sharma'
            },
            {
                time: '10:11 AM - 11:50 AM',
                name: 'Mobile App Development',
                location: 'B-316',
                teacher: 'Mr Nehal Kadyan'
            },
            {
                time: '11:50 AM - 12:40 PM',
                name: 'Mobile App Development',
                location: 'B-312',
                teacher: 'Mr Nehal Kadyan'
            },
            {
                time: '12:40 PM - 1:30 PM',
                name: 'Lunch Break',
                location: '-',
                teacher: '-'
            },
            {
                time: '1:30 PM - 2:20 PM',
                name: 'Life Skills for Professionals',
                location: 'B-220',
                teacher: 'Mr Vikas Singh'
            },
            {
                time: '2:20 PM - 3:10 PM',
                name: 'Operating System',
                location: 'B-121',
                teacher: 'Mrs Yogita Raghav'
            },
            {
                time: '3:10 PM - 4:00 PM',
                name: 'Operating System',
                location: 'B-121',
                teacher: 'Mrs Yogita Raghav'
            }
        ]
    },
    {
        day: 'Tuesday',
        subjects: [
            {
                time: '9:10 AM - 10:00 AM',
                name: 'Lab - Operating Systems',
                location: 'Lab - 22 (B Block 2nd Floor)',   
                teacher: 'Mrs Yogita Raghav'
            },
            {
                time: '10:05 AM - 10:55 AM',
                name: 'Lab - Operating Systems',
                location: 'Lab - 22 (B Block 2nd Floor)',   
                teacher: 'Mrs Yogita Raghav'
            },
            {
                time: '11:00 AM - 11:50 AM',
                name: 'Lab - Mobile Development',
                location: 'Lab - 10 (A Block Library)',
                teacher: 'Mr Nehal Kadyan'
            },
            {
                time: '11:50 AM - 12:40 PM',
                name: 'Lab - Mobile Development',
                location: 'Lab - 10 (A Block Library)',
                teacher: 'Mr Nehal Kadyan'
            },
            {
                time: '12:40 PM - 1:30 PM',
                name: 'Lunch Break',
                location: '-',
                teacher: '-'
            },
            {
                time: '1:30 PM - 2:20 PM',
                name: '-',
                location: '-',
                teacher: '-'
            },
            {
                time: '2:20 PM - 3:10 PM',
                name: 'Competitive Programming',
                location: 'A-313',
                teacher: 'Mr Ashutosh Dubey'
            },
            {
                time: '3:10 PM - 4:00 PM',
                name: 'Competitive Programming',
                location: 'A-313',
                teacher: 'Mr Ashutosh Dubey'
            }
        ]
    },
    {
        day: 'Wednesday',
        subjects: [
            {
                time: '9:10 AM - 10:00 AM',
                name: 'Theory of Computation',
                location: 'B-316',
                teacher: 'Mrs Megha Sharma'
            },
            {
                time: '10:05 AM - 10:55 AM',
                name: 'Software Engineering',
                location: 'B-317',
                teacher: 'Mrs Kriti Sharma'
            },
            {
                time: '11:00 AM - 11:50 AM',
                name: 'Software Engineering',
                location: 'B-317',
                teacher: 'Mrs Kriti Sharma'
            },
            {
                time: '11:50 AM - 12:40 PM',
                name: 'Mobile App Development',
                location: 'B-312',
                teacher: 'Mr Nehal Kadyan'
            },
            {
                time: '12:40 PM - 1:30 PM',
                name: 'Lunch Break',
                location: '-',
                teacher: '-'
            },
            {
                time: '1:30 PM - 2:20 PM',
                name: 'Mobile App Development',
                location: 'B-317',
                teacher: 'Mr Nehal Kadyan'
            },
            {
                time: '2:20 PM - 3:10 PM',
                name: 'Lab - New Age Programming Language',
                location: 'Lab - 10 (A Block Library)',
                teacher: 'Mr Aryan Sharma'
            },
            {
                time: '3:10 PM - 4:00 PM',
                name: 'Lab - New Age Programming Language',
                location: 'Lab - 10 (A Block Library)',
                teacher: 'Mr Aryan Sharma'
            },
        ]
    },
    {
        day: 'Thursday',
        subjects: [
            {
                time: '9:10 AM - 10:00 AM',
                name: 'Theory of Computation',
                location: 'B-314',
                teacher: 'Mrs Megha Sharma'
            },
            {
                time: '10:05 AM - 10:55 AM',
                name: 'Theory of Computation',
                location: 'B-312',
                teacher: 'Mrs Megha Sharma'
            },
            {
                time: '11:00 AM - 11:50 AM',
                name: '-',
                location: '-',
                teacher: '-'
            },
            {
                time: '11:50 AM - 12:40 PM',
                name: 'Life Skills for Professionals',
                location: 'B-220',
                teacher: 'Mr Vikas Singh'
            },
            {
                time: '12:40 PM - 1:30 PM',
                name: 'Life Skills for Professionals',
                location: 'B-220',
                teacher: 'Mr Vikas Singh'
            },
            {
                time: '1:30 PM - 2:20 PM',
                name: 'Operating System',
                location: 'B-317',
                teacher: 'Mrs Yogita Raghav'
            },
            {
                time: '2:20 PM - 3:10 PM',
                name: 'Competitive Programming',
                location: 'A-313',
                teacher: 'Mr Ashutosh Dubey'
            },
            {
                time: '3:10 PM - 4:00 PM',
                name: 'Competitive Programming',
                location: 'A-313',
                teacher: 'Mr Ashutosh Dubey'
            }
        ]
    },
    {
        day: 'Friday',
        subjects: [
            {
                time: '9:10 AM - 10:00 AM',
                name: 'Software Engineering',
                location: 'B-317',
                teacher: 'Mrs Kriti Sharma'
            },
            {
                time: '10:05 AM - 10:55 AM',
                name: 'Software Engineering',
                location: 'B-218',
                teacher: 'Mrs Kriti Sharma'
            },
            {
                time: '11:00 AM - 11:50 AM',
                name: 'Lab - New Age Programming Language',
                location: 'Lab - 10 (A Block Library)',
                teacher: 'Mr Aryan Sharma'
            },
            {
                time: '11:50 AM - 12:40 PM',
                name: 'Lab - New Age Programming Language',
                location: 'Lab - 10 (A Block Library)',
                teacher: 'Mr Aryan Sharma'
            },
            {
                time: '12:40 PM - 1:30 PM',
                name: 'Lunch Break',
                location: '-',
                teacher: '-'
            },
            {
                time: '1:30 PM - 2:20 PM',
                name: '-',
                location: '-',
                teacher: '-'
            },
            {
                time: '2:20 PM - 3:10 PM',
                name: 'Operating System',
                location: 'B-317',
                teacher: 'Mrs Yogita Raghav'
            },
            {
                time: '3:10 PM - 4:00 PM',
                name: 'Operating System',
                location: 'B-317',
                teacher: 'Mrs Yogita Raghav'
            }
        ]
    }
];

export default timetableUtil;


