import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authService = {
    async saveAuthData(token: string, user: object) {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
            console.log('✅ Auth data saved successfully');
        } catch (error) {
            console.error('❌ Error saving auth data:', error);
        }
    },

    async getToken() {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            console.log('🔑 Token retrieved:', token ? 'EXISTS' : 'NULL');
            return token;
        } catch (error) {
            console.error('❌ Error getting token:', error);
            return null;
        }
    },

    async getUserData(){
        try {
            const userData = await AsyncStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Error getting user data:', error);
            return null;
        }
    },

    async isLoggedIn() {
        const token = await this.getToken();
        const loggedIn = !!token;
        console.log('🔐 Is logged in?', loggedIn);
        return loggedIn;
    },

    async logout() {
        try {
            console.log('🗑️ Clearing auth data...');
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
            console.log('✅ Auth data cleared successfully');
        } catch (error) {
            console.error('❌ Error during logout:', error);
            throw error;
        }
    }
}