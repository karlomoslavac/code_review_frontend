<template>
  <div>
    <div class="header">
        <h1>Code Review</h1>
        <button class="logout-btn" @click="logout">Logout</button>
    </div>
    <div class="content">
      <h2>Enter your code</h2>
      <form @submit.prevent="submitCode">
        <textarea v-model="code" class="code-input"></textarea>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </div>
    <div v-for="codeItem in codes" :key="codeItem._id" class="code-item">
      <div class="code-sections">
        <div class="code-left">
          <pre class="code-text">{{ !codeItem.showFull && codeItem.code.length > 100 ? codeItem.code.substring(0, 100) + '...' : codeItem.code }}</pre>
          <button v-if="codeItem.code.length > 100" @click="codeItem.showFull = !codeItem.showFull">
            {{ codeItem.showFull ? 'Show less' : 'See more' }}
          </button>
        </div>
        <div class="code-right">
          <p>
            Author: {{ codeItem.user.username }}
            <span v-if="codeItem.user._id === user.id">
              <button @click="toggleEdit(codeItem)">Edit</button>
              <button @click="deleteCode(codeItem._id)">Delete</button>
            </span>
            <span class="rating-section">
              Rating: {{ codeItem.rating }}
              <button @click="rateCode(codeItem, 1)">👍</button>
              <button @click="rateCode(codeItem, -1)">👎</button>
            </span>
          </p>
          <div v-if="codeItem.editing" class="edit-section">
            <textarea v-model="codeItem.code" class="edit-input"></textarea>
            <button @click="saveCode(codeItem)">Save</button>
          </div>
          <div class="comments-section">
            <div v-if="codeItem.comments && codeItem.comments.length > 0">
              <div v-for="(comment, index) in visibleComments(codeItem)" :key="comment._id" class="comment">
                <p><strong>{{ comment.user.username }}:</strong> {{ comment.text }}</p>
              </div>
              <button v-if="codeItem.comments.length > 3 && codeItem.showMoreComments" @click="codeItem.showMoreComments = false" class="see-more-comments">Show less</button>
              <button v-else-if="codeItem.comments.length > 3 && !codeItem.showMoreComments" @click="codeItem.showMoreComments = true" class="see-more-comments">See more comments</button>
            </div>
            <form @submit.prevent="addComment(codeItem._id, codeItem)" class="comment-form">
              <input v-model="codeItem.newComment" placeholder="Add a comment" class="comment-input">
              <button type="submit" class="comment-btn">Comment</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    user: Object,
  },
  data() {
    return {
      code: '',
      codes: [],
      newComment: '',
      errorMessage: ''
    };
  },
  methods: {
    fetchCodes() {
      axios.get('/codes').then(response => {
        this.codes = response.data.reverse().map(codeItem => ({
          ...codeItem,
          showFull: false,
          editing: false,
          showMoreComments: false,
          newComment: ''
        }));
      });
    },
    submitCode() {
      if (this.code.trim() === '') { 
        this.errorMessage = 'Please enter some code.'; 
      } else {
        this.errorMessage = ''; 
        axios.post('/codes', { code: this.code }, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        }).then(() => {
          this.fetchCodes();
          this.code = '';
        }).catch(error => {
          if (error.response) {
            this.errorMessage = 'An error occurred. Please try again later.';
          }
        });
      }
    },
    toggleEdit(codeItem) {
      codeItem.editing = !codeItem.editing;
    },
    saveCode(codeItem) {
      axios.put(`/codes/${codeItem._id}`, { code: codeItem.code }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      }).then(this.fetchCodes);
    },
    deleteCode(id) {
      if (confirm('Are you sure you want to delete this code?')) {
        axios.delete(`/codes/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        }).then(this.fetchCodes);
      }
    },
    addComment(id, codeItem) {
      axios.post(`/codes/${id}/comments`, { text: codeItem.newComment }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      }).then(() => {
        this.fetchCodes();
        codeItem.newComment = '';
      });
    },
    rateCode(codeItem, value) {
      const updatedRating = codeItem.rating + value;
      axios.put(`/codes/${codeItem._id}/rate`, { rating: updatedRating }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      }).then(this.fetchCodes).catch(error => {
        console.error('Error rating code:', error);
      });
    },
    visibleComments(codeItem) {
      return codeItem.showMoreComments ? codeItem.comments : codeItem.comments.slice(0, 3);
    },
    logout() {
      localStorage.removeItem('token');
      this.$emit('logout');
    }
  },
  mounted() {
    this.fetchCodes();
  }
};
</script>


<style scoped>
.header {
  align-items: left;
}

h1 {
  background-color: rgba(245, 245, 245, 0.7);
  display: inline-block;
  margin: 0;
  padding: 10px;
}

.logout-btn {
  margin: 0;
}

.content {
  margin-top: 20px; 
  padding: 20px;
}

h2 {
  background-color: rgba(245, 245, 245, 0.7);
  display: inline-block; 
  margin-top: 20px; 
  padding: 10px; 
}

.code-item {
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.code-sections {
  display: flex;
  flex-direction: row;
}

.code-left {
  flex: 1;
  background-color: #e8e8e8;
  padding: 20px;
  white-space: pre-wrap;
  text-align: left;
}

.code-right {
  flex: 1;
  background-color: #f5f5f5;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.code-text {
  white-space: pre-wrap;
  text-align: left;
}

.comments-section {
  background-color: #e8e8e8;
  padding: 20px;
  margin-top: 10px;
}

.comment {
  margin-bottom: 10px;
}

.rating-section {
  display: inline-flex;
  align-items: center;
  margin-left: 20px;
}

.rating-section button {
  margin-left: 10px;
}

.edit-section {
  display: flex;
  flex-direction: column;
}

.edit-input {
  min-height: 200px; 
  margin-bottom: 10px;
}

textarea.code-input {
  min-height: 200px; 
  width: 100%;
}

button.submit-btn {
  margin-top: 10px;
}

button {
  margin-left: 10px; 
}

.comments-section input.comment-input {
  width: calc(100% - 120px);
  margin-right: 10px; 
}

.comments-section .comment-btn {
  margin-left: 10px; 
}

.comments-section .comment-form {
  display: flex;
  align-items: center;
}

button.logout-btn {
  margin-left: 20px; 
}

button {
  margin-left: 10px;
}

.comments-section .see-more-comments {
  margin-top: 10px; 
  margin-bottom: 20px;
}

.error-message {
  color: red;
  background-color: rgba(245, 245, 245, 0.9);
  display: inline-block;
  margin-top: 20px;
  padding: 10px;
  font-weight: bold; 
}
</style>

