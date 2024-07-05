import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Substitua pela URL da sua API

class AuthService {
    login(user) {
        return axios
            .post(`${API_URL}/auth/login`, {
                email: user.email,
                password: user.password
            })
            .then(response => {
                if (response.data.accessToken) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem('user');
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    getUserProfile() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }
}

export default new AuthService();
