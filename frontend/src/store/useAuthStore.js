import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? 'http://localhost:3000' : '/';

export const useAuthStore = create((set,get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser: res.data});
            get().connectSocket(); // Connect to socket after successful auth check
        } catch (error) {
            console.error('Error in authCheck:', error);
            set({authUser: null});
        } finally {
            set({isCheckingAuth: false});
        }
    },

    signup : async (data) => {
        set({isSigningUp: true});
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            set({authUser: res.data});

            toast.success('Signup successful! Welcome to Pulse Chat!');

            get().connectSocket(); // Connect to socket after successful signup
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isSigningUp: false});
        }
    },

    login : async (data) => {
        set({isLoggingIn: true});
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({authUser: res.data});

            toast.success('Login successful! Welcome back to Pulse Chat!');

            get().connectSocket(); // Connect to socket after successful login
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isLoggingIn: false});
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser: null});
            toast.success('Logged out successfully!');
            get().disconnectSocket(); // Disconnect from socket on logout
        } catch (error) {
            toast.error('Error occurred while logging out.');
            console.error('Logout error:', error);
        }
    },

    updateProfile: async (data) => {
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data });
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Error updating profile. Please try again.');
            console.error('Profile update error:', error);
            
        }
    },

    connectSocket: () => {
        const { authUser} = get();
        if(!authUser || get().socket?.connected) return

        const socket = io(BASE_URL, {
            withCredentials: true, // Include cookies in the connection request
        })

        socket.connect();

        set({socket});

        // listen for online user event
        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds});
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected)  get().socket.disconnect();
    }



}));