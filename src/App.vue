<template>
  <div id="app">
    <Login v-if="!user" @login="setUser"></Login>
    <Home v-else :user="user" @logout="clearUser"></Home>
  </div>
</template>

<script>
import axios from 'axios';
import Login from './components/Login.vue';
import Home from './views/Home.vue';

export default {
  components: { Login, Home },
  data() {
    return {
      user: null,
    };
  },
  methods: {
    setUser(user) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (token) {
      axios.post('/users/auth', {}, {
        headers: { 'x-auth-token': token }
      }).then(response => {
        this.user = response.data;
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
