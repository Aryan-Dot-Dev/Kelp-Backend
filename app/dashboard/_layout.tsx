import { Stack } from "expo-router";

const DashboardLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
            <Stack.Screen name="timetable" options={{ title: "TimeTable" }} />
        </Stack>
    );
};

export default DashboardLayout;