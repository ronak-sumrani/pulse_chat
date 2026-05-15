import {create} from 'zustand';

export const useAuthStore = create((set) => ({
    authUser: {name: 'Ronak', _id: '12345', age : 22},
    isLoggedIn: false,

    login: () => {
        console.log('We just logged in!');
        set({isLoggedIn: true});
    }
}));