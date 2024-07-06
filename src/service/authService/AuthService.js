import http from '@/service/Axios';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
      user: localStorage.getItem('user') || null,
      roles: localStorage.getItem('roles') || [],
      token: localStorage.getItem('token') || '',
    }),
    actions: {
      async login(credentials) {
        const response = await http.post('/auth/login', credentials);
        const acessToken = response.data.accessToken;
        const user = '1';
        const roles = ["admin", "user"];
        localStorage.setItem('token', acessToken);
        localStorage.setItem('roles', roles);
        localStorage.setItem('user', user);
        http.defaults.headers.common['Authorization'] = `Bearer ${acessToken}`;
        this.user = user;
        this.roles = roles;
        this.token = acessToken;
      },
      logout() {
        localStorage.removeItem('token');
        delete http.defaults.headers.common['Authorization'];
        this.user = null;
        this.roles = [];
        this.token = '';
      },
    },
    getters: {
      isAuthenticated: (state) => !!state.token,
      hasRole: (state) => (role) => state.roles.includes(role),
    },
});