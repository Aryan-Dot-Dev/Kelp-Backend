type RegisterRequest = {
    email: string;
    password: string;
    role: 'STUDENT' | 'TEACHER' | 'CR';
    otp: string;
}
