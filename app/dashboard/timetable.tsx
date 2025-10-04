import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from "@expo-google-fonts/nunito";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import timetableUtil from '../../utils/timetable.util';

interface Subject {
    time: string;
    name: string;
    location: string;
    teacher: string;
}

interface DaySchedule {
    day: string;
    subjects: Subject[];
}

interface WeekDay {
    dayName: string;
    date: Date;
    dateStr: string;
    isToday: boolean;
}

// Parse time string to minutes from midnight for comparison
const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
};

// Check if current time falls within a subject's time slot
const isCurrentSubject = (subject: Subject): boolean => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Parse start and end times from "9:10 AM - 10:00 AM" format
    const timeParts = subject.time.split(' - ');
    if (timeParts.length !== 2) return false;
    
    const startMinutes = parseTimeToMinutes(timeParts[0].trim());
    const endMinutes = parseTimeToMinutes(timeParts[1].trim());
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

// Get the current week's dates (Monday to Friday)
const getCurrentWeekDates = (): WeekDay[] => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate days to subtract to get to Monday
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    
    const weekDays: WeekDay[] = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        
        const isToday = date.toDateString() === today.toDateString();
        
        weekDays.push({
            dayName: dayNames[i],
            date: date,
            dateStr: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`,
            isToday: isToday
        });
    }
    
    return weekDays;
};

export default function TimeTable() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    const [weekDays, setWeekDays] = useState<WeekDay[]>(getCurrentWeekDates());
    const [selectedDay, setSelectedDay] = useState(() => {
        const today = weekDays.find(day => day.isToday);
        return today ? today.dayName : 'Monday';
    });
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const dates = getCurrentWeekDates();
        return dates[0].date;
    });

    useEffect(() => {
        const dates = getCurrentWeekDates();
        setWeekDays(dates);
        const today = dates.find(day => day.isToday);
        if (today) {
            setSelectedDay(today.dayName);
        }
    }, []);

    if (!fontsLoaded) return null;

    const currentDayData = (timetableUtil as DaySchedule[]).find((item: DaySchedule) => item.day === selectedDay);

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeekStart(newWeekStart);

        const newWeekDays: WeekDay[] = [];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const today = new Date();

        for (let i = 0; i < 5; i++) {
            const date = new Date(newWeekStart);
            date.setDate(newWeekStart.getDate() + i);
            
            const isToday = date.toDateString() === today.toDateString();
            
            newWeekDays.push({
                dayName: dayNames[i],
                date: date,
                dateStr: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`,
                isToday: isToday
            });
        }

        setWeekDays(newWeekDays);
        
        // Auto-select today if it's in the new week, otherwise select Monday
        const todayInWeek = newWeekDays.find(day => day.isToday);
        setSelectedDay(todayInWeek ? todayInWeek.dayName : 'Monday');
    };

    const goToCurrentWeek = () => {
        const dates = getCurrentWeekDates();
        setWeekDays(dates);
        setCurrentWeekStart(dates[0].date);
        const today = dates.find(day => day.isToday);
        setSelectedDay(today ? today.dayName : 'Monday');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#004d40', '#00897b', '#4db6ac']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <BlurView intensity={40} style={StyleSheet.absoluteFillObject} tint="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>TimeTable</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Week Navigation */}
            <View style={styles.weekNavigation}>
                <TouchableOpacity 
                    style={styles.weekNavButton}
                    onPress={() => navigateWeek('prev')}
                >
                    <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.currentWeekButton}
                    onPress={goToCurrentWeek}
                >
                    <Text style={styles.weekRangeText}>
                        {weekDays[0].dateStr} - {weekDays[4].dateStr}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.weekNavButton}
                    onPress={() => navigateWeek('next')}
                >
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Day Selector with Dates */}
            <View style={styles.daySelectorWrapper}>
                <ScrollView
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.daySelector}
                >
                    {weekDays.map((day) => (
                    <TouchableOpacity
                        key={day.dayName}
                        style={[
                            styles.dayButton,
                            selectedDay === day.dayName && styles.dayButtonActive,
                            day.isToday && styles.dayButtonToday
                        ]}
                        onPress={() => setSelectedDay(day.dayName)}
                    >
                        <Text style={[
                            styles.dayButtonText,
                            selectedDay === day.dayName && styles.dayButtonTextActive,
                            day.isToday && !selectedDay && styles.dayButtonTextToday
                        ]}>
                            {day.dayName.substring(0, 3)}
                        </Text>
                        <Text style={[
                            styles.dateText,
                            selectedDay === day.dayName && styles.dateTextActive,
                            day.isToday && styles.dateTextToday
                        ]}>
                            {day.dateStr}
                        </Text>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            </View>

            {/* Timetable Content */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.timetableContainer}>
                    {currentDayData?.subjects.map((subject: Subject, index: number) => {
                        const isBreak = subject.name === 'Lunch Break' || subject.name === '-';
                        const isLunchBreak = subject.name === 'Lunch Break';
                        
                        // Check if this is the current ongoing lecture
                        const isCurrent = !isBreak && isCurrentSubject(subject);
                        
                        // Check if this is the next lecture (first non-break subject after current time)
                        let isNext = false;
                        if (!isBreak && !isCurrent && currentDayData) {
                            const now = new Date();
                            const currentMinutes = now.getHours() * 60 + now.getMinutes();
                            const subjectStartMinutes = parseTimeToMinutes(subject.time.split(' - ')[0].trim());
                            
                            // This is next if it starts after current time and no other subject is currently ongoing
                            if (subjectStartMinutes > currentMinutes) {
                                const hasOngoingSubject = currentDayData.subjects.some(s => 
                                    !['Lunch Break', '-'].includes(s.name) && isCurrentSubject(s)
                                );
                                
                                if (hasOngoingSubject) {
                                    // Find first subject after the ongoing one
                                    const ongoingIndex = currentDayData.subjects.findIndex(s => 
                                        !['Lunch Break', '-'].includes(s.name) && isCurrentSubject(s)
                                    );
                                    const nextNonBreakIndex = currentDayData.subjects.findIndex((s, i) => 
                                        i > ongoingIndex && !['Lunch Break', '-'].includes(s.name)
                                    );
                                    isNext = nextNonBreakIndex === index;
                                } else {
                                    // Find first subject that starts after current time
                                    const nextIndex = currentDayData.subjects.findIndex(s => {
                                        if (['Lunch Break', '-'].includes(s.name)) return false;
                                        const startMin = parseTimeToMinutes(s.time.split(' - ')[0].trim());
                                        return startMin > currentMinutes;
                                    });
                                    isNext = nextIndex === index;
                                }
                            }
                        }
                        
                        return (
                            <View 
                                key={index} 
                                style={[
                                    styles.subjectCard,
                                    isBreak && styles.subjectCardBreak,
                                    isCurrent && styles.subjectCardCurrent,
                                    isNext && styles.subjectCardNext
                                ]}
                            >
                                {/* Status Indicator & Time Badge */}
                                <View style={styles.cardHeader}>
                                    {isCurrent && (
                                        <View style={styles.statusBadge}>
                                            <View style={styles.liveDot} />
                                            <Text style={styles.statusText}>ONGOING</Text>
                                        </View>
                                    )}
                                    {isNext && (
                                        <View style={[styles.statusBadge, styles.statusBadgeNext]}>
                                            <Ionicons name="arrow-forward-circle-outline" size={14} color="#4db6ac" />
                                            <Text style={[styles.statusText, styles.statusTextNext]}>NEXT</Text>
                                        </View>
                                    )}
                                    <View style={[styles.timeBadge, (isCurrent || isNext) && styles.timeBadgeHighlight]}>
                                        <Ionicons name="time-outline" size={16} color={isCurrent ? "#ef5350" : isNext ? "#4db6ac" : "#00897b"} />
                                        <Text style={styles.timeText}>{subject.time}</Text>
                                    </View>
                                </View>

                                {isLunchBreak ? (
                                    <View style={styles.breakContainer}>
                                        <Ionicons name="restaurant-outline" size={36} color="#FFFFFF" />
                                        <Text style={styles.breakText}>Lunch Break</Text>
                                    </View>
                                ) : isBreak ? (
                                    <View style={styles.breakContainer}>
                                        <Ionicons name="moon-outline" size={36} color="#FFFFFF" />
                                        <Text style={styles.freeText}>Free Period</Text>
                                    </View>
                                ) : (
                                    <>
                                        {/* Subject Name */}
                                        <Text style={styles.subjectName}>{subject.name}</Text>
                                        
                                        {/* Details Row */}
                                        <View style={styles.detailsRow}>
                                            {/* Location */}
                                            <View style={styles.detailItem}>
                                                <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.7)" />
                                                <Text style={styles.detailText}>{subject.location}</Text>
                                            </View>
                                            
                                            {/* Teacher */}
                                            <View style={styles.detailItem}>
                                                <Ionicons name="person-outline" size={16} color="rgba(255,255,255,0.7)" />
                                                <Text style={styles.detailText}>{subject.teacher}</Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>End of Day</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: "Nunito_700Bold",
        fontSize: 24,
        color: '#FFFFFF',
    },
    placeholder: {
        width: 40,
    },
    weekNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    weekNavButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentWeekButton: {
        flex: 1,
        marginHorizontal: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
    },
    weekRangeText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    daySelectorWrapper: {
        paddingVertical: 12,
        maxHeight: 90,
    },
    daySelector: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dayButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginRight: 10,
        alignItems: 'center',
        minWidth: 70,
    },
    dayButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    dayButtonToday: {
        borderColor: '#4db6ac',
        borderWidth: 2,
    },
    dayButtonText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2,
    },
    dayButtonTextActive: {
        color: '#00897b',
    },
    dayButtonTextToday: {
        color: '#4db6ac',
    },
    dateText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    dateTextActive: {
        color: '#00897b',
    },
    dateTextToday: {
        color: '#4db6ac',
        fontFamily: "Nunito_600SemiBold",
    },
    content: {
        flex: 1,
    },
    timetableContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    subjectCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    subjectCardBreak: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    subjectCardCurrent: {
        backgroundColor: 'rgba(239, 83, 80, 0.2)',
        borderColor: '#ef5350',
        borderWidth: 2,
    },
    subjectCardNext: {
        backgroundColor: 'rgba(77, 182, 172, 0.2)',
        borderColor: '#4db6ac',
        borderWidth: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 83, 80, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    statusBadgeNext: {
        backgroundColor: 'rgba(77, 182, 172, 0.9)',
    },
    statusText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 10,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    statusTextNext: {
        color: '#FFFFFF',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    timeBadgeHighlight: {
        backgroundColor: '#FFFFFF',
    },
    timeText: {
        fontFamily: "Nunito_600SemiBold",
        fontSize: 12,
        color: '#00897b',
    },
    subjectName: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    detailsRow: {
        gap: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    breakContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    breakText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#FFFFFF',
        marginTop: 8,
    },
    freeText: {
        fontFamily: "Nunito_700Bold",
        fontSize: 18,
        color: '#FFFFFF',
        marginTop: 8,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    footerText: {
        fontFamily: "Nunito_400Regular",
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
});
