import { act } from 'react';
import { create } from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import { all } from 'axios';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: 'chats',
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem('isSoundEnabled') === 'true',

    toggleSound: () => {
        localStorage.setItem('isSoundEnabled', !get().isSoundEnabled);
        set((state) => ({ isSoundEnabled: !state.isSoundEnabled }));
    },

    setActiveTab: (tab) => set({ activeTab: tab }), // Set the active tab (chats or contacts)
    setSelectedUser: (selectedUser) => set({ selectedUser }), // Set the selected user for chat

    getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get('/messages/contacts');
            set({ allContacts: res.data });
        } catch (error) {
            toast.error('Error fetching contacts:', error);
        } finally {
            set({ isUsersLoading: false });
        }
    },
    getMyChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get('/messages/chats');
            set({ chats: res.data });
        } catch (error) {
            toast.error('Error fetching chat partners:', error);
        } finally {
            set({ isUsersLoading: false });
        }
    },

}));