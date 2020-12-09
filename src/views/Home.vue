<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld :msg="message" />
  </div>

  <button @click="login" v-if="!this.msal.data.isAuthenticated">Login</button>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue';
import { useMsal } from '@/plugins/msal-auth/useAPI';
// eslint-disable-next-line no-unused-vars
import { iMsal } from '@/plugins/msal-auth/types';

@Options({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {
  private msal: iMsal = useMsal();

  get message() {
    if (this.msal && this.msal.isAuthenticated()) return `Welcome ${this.msal.data.user.name}`;
    else return 'Welcome to Your Vue.js + TypeScript App';
  }

  login() {
    this.msal.signIn();
  }
}
</script>
