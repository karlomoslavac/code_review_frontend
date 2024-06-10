<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" required>
      <input v-model="password" type="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: ''
      
    };
  },
  methods: {
    login() {
      axios.post('/users/login', { username: this.username, password: this.password })
        .then(response => {
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          this.$emit('login', user);
        })
        .catch(() => {
          alert('Invalid login credentials');
        });
    }
  }
};
</script>

<style scoped>
h2 {
  background-color: rgba(245, 245, 245, 0.7);
  padding: 10px;
  margin: 20px;
  display: inline-block;
}

input {
  margin: 10px;
  padding: 10px;
  font-size: 1rem;
}
button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
