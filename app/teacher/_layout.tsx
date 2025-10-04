import { Stack } from 'expo-router';

export default function TeacherLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="students-attendance" />
            <Stack.Screen name="assignments" />
        </Stack>
    );
}
