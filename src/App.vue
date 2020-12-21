<template>
  <div id="app">
    <!--<LoadingScreen :isLoading="isLoading" />-->
    <!-- <LoadingScreen></LoadingScreen>
    <main v-if="!isLoading">
        <Main msg="Welcome to Your Vue.js App" />
    </main> -->

    <router-view />
  </div>
</template>

<script>
import Main from "./components/main.vue";
import LoadingScreen from "./components/LoadingScreen";
/*import axios from 'axios'
var axiosInstance = axios.create({
    baseURL: `${location.protocol}//${location.hostname}:3000`,
})*/
export default {
  name: "app",
  components: {
    Main,
    LoadingScreen,
  },
  data() {
    return {
      isLoading: true,
    };
  },
  /*mounted() {
 
        const intervalObj = setInterval(() => {
            axiosInstance.get('getDrive').then((response) => {
              console.log(response.data.drives)
              if(response.data.drives === 'OK'){
                this.isLoading = false;
                console.log(response.data.mountPoints.path)
                this.$store.commit('setUsbPath', response.data.mountPoints.path)
                clearInterval(intervalObj);
              }
            })
        }, 1500);
    }*/
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600;800&family=Sarabun:wght@200;400;600;800&display=swap");

#app {
  /*font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;*/
  color: #333;
}

* {
  margin: 0;
  padding: 0;
  outline: none;
  box-sizing: border-box;
  font-family: "Poppins", "Sarabun", sans-serif;
}
a {
  text-decoration: none;
  color: unset;
}
ul {
  list-style: none;
  padding: 0;
}

.my-modal-class > .modal-dialog > .modal-content {
  .modal-header {
    background: #007e4e !important;
    color: #ffffff !important;
    button {
      position: relative;
      opacity: 0.9;
      &::before {
        content: "";
        display: block;
        background-color: #ffffff;
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        z-index: -1;
        top: 15px;
        right: 12px;
      }
    }
    h5 {
      font-weight: bold;
    }
    .close {
      font-weight: normal;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .modal-body {
    padding: 30px;
    .modal-ttl {
      font-weight: bold;
      text-align: center;
      color: #0090ff;
      margin-bottom: 15px;
    }
    .modal-desc {
      text-align: center;
      margin-bottom: 15px;
    }
  }
}

.my-modal-class-no-pad > .modal-dialog > .modal-content > .modal-body {
  padding: 0px !important;
}
</style>
