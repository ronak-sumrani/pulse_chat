import { create } from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore.js';



export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: 'chats',
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem('isSoundEnabled')) === 'true',

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

    getMessagesByUserId: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching messages');
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser , messages} = get();
        const {authUser} = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            sender: authUser._id,
            receiver: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true, // Flag to identify optimistic messages
        };
        // immediately update the UI with the optimistic message
        set({messages: [...messages, optimisticMessage]});

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages: messages.concat(res.data)});
        } catch (error) {
            set({messages: messages}); // Revert to original messages on error
            toast.error(error.response?.data?.message || 'Error sending message');
        }
    },

    subscribeToMessages: () => {
        const {selectedUser, isSoundEnabled} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if(!isMessageSentFromSelectedUser) return; // only update messages if the new message is from the currently selected user
            const currentMessages = get().messages;
            set({messages: [...currentMessages, newMessage]});
        });

        // play sound when new message arrives and sound is enabled in settings
        if(isSoundEnabled) {
            const notificationSound = new Audio('sounds/notification.mp3');
            notificationSound.currentTime = 0; // reset sound to start so that it can play again if already playing
            notificationSound.play().catch((e) => console.log("Error playing notification sound", e));
            
        }
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    }
}));