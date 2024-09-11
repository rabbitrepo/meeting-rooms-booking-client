import { Client, Account } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) // Your AppWrite endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID); // Your AppWrite project ID

const account = new Account(client);

export const sendOtp = async (userId: string, email: string) => {
    try {
        const result = await account.createEmailToken(
            userId,
            email,
        );

        return result;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP.'); // Rethrow to handle it later
    }
}

export const verifyOtp = async (userId: string, otp: string) => {
    try {
        const result = await account.createSession(userId, otp);
        return result;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new Error('OTP verification failed.'); // Rethrow for handling in the component
    }
}

export const getSession = async () => {
    try {
        const result = await account.getSession('current');
        return result;
    } catch (error) {
        console.error('Error fetching session:', error);
        throw new Error('Error fetching session.'); // Rethrow for handling in the component
    }
}

export const logout = async () => {
    try {
        const result = await account.deleteSession('current');
        return result;
    } catch (error) {
        console.error('Error logging out:', error);
        throw new Error('Error logging out.'); // Rethrow for handling in the component
    }
}

export const getUser = async () => {
    try {
        const result = await account.get();
        return result;
    } catch (error) {
        console.error('Error fetching account:', error);
        throw new Error('Error fetching account.'); // Rethrow for handling in the component
    }
}