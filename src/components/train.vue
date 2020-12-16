<template>
  <div style="height: 100vh; width: 100vw;">
    <b-input-group class="train-panel">
      <!-- <b-input-group-prepend>
        <b-button class="btn-create" variant="primary" @click="onCreate"
          >Create</b-button
        >
      </b-input-group-prepend>
      <b-form-input
        class="input-url"
        v-model="url"
        placeholder="Put Google Colab URL here . . ."
      ></b-form-input> -->
      <b-input-group-append>
        <button class="btn base-btn" :disabled="trainable" @click="onTrain()">
          <b-spinner v-if="loading" small type="grow"></b-spinner
          >{{ isTraining ? "Train" : "Train" }}
        </button>
        <button class="btn base-btn" @click="onInference">
          Test
        </button>
        <button
          class="btn base-btn"
          :disabled="!downloadable"
          @click="downloadAndExtract"
        >
          <b-spinner v-if="isDownloading" small type="grow"></b-spinner>Download
        </button>
      </b-input-group-append>
    </b-input-group>
    <b-card no-body class="train-pgr">
      <div class="bg-secondary text-light px-3 py-2 scroll-box" ref="logsBox">
        training result:<br />
        <div v-html="result" />
        <div v-html="logs" />
      </div>
    </b-card>

    <b-modal
      id="inference"
      centered
      title="TEST"
      modal-class="my-modal-class"
      :hide-footer="true"
    >
      <div class="display-screen">test</div>
      <div class="infer-class">
        <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
        <span>TOTORO</span>
      </div>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`,
});

export default {
  name: "Training",
  components: {},
  props: {},
  created() {},
  data() {
    return {
      url: "",
      file: null,
      result: "",
      logs: "",
      loading: false,
      polling: null,
      lastState: "",
      isDone: false,
      isTraining: false,
      isDownloading: false,
    };
  },
  methods: {
    onCreate: () => {
      window.open(
        "https://colab.research.google.com/drive/1aG7kNzByeqW2fvWWHT5fM4Nmpt48nt8J",
        "_blank"
      );
    },
    prepareData: function() {
      this.result += `Preparing data ... <br />`;
      return axiosInstance.post(
        "/archiveFile",
        { path: this.getProjectDir },
        {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    },
    checkRunning: function() {
      return axios.get(`${this.url}/train/is_running`);
    },
    stopTraining: function() {
      return axios.get(`${this.url}/train/stop`);
    },
    getLogs: function() {
      return axios.get(`${this.url}/train/log`);
    },
    downloadAndExtract: async function() {
      this.isDownloading = true;
      const model = await axios.get(`${this.url}/download`, {
        responseType: "arraybuffer",
      });
      var file = new File([model.data], "model.tar.gz", {
        type: "application/gzip",
      });
      let formData = new FormData();
      formData.append("file", file);
      formData.append("path", this.getProjectDir);
      await axiosInstance.post("/extractFile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      this.isDownloading = false;
    },
    onTrain: async function() {
      this.loading = true;
      this.isDone = false;
      this.isTraining = false;
      this.result = "";
      const data = await this.prepareData();
      this.result += `Successfully prepare data. <br />`;
      this.result += `Uploading data ... <br />`;
      let formData = new FormData();
      var file = new File([data.data], "data.zip", { type: "application/zip" });
      formData.append("file", file);
      let vm = this;
      axios
        .post(`${this.url}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(function(res) {
          vm.result += `${res.data} <br />`;
          vm.isTraining = true;
          const polling = setInterval(async () => {
            const res = await vm.checkRunning();
            if (res.data === "True") {
              const log = await vm.getLogs();
              vm.logs = log.data.replace(/(?:\r\n|\r|\n)/g, "<br>");
            } else {
              vm.loading = false;
              vm.isDone = true;
              clearInterval(polling);
            }
          }, 15000);
        })
        .catch(function(e) {
          console.error(e);
          vm.result += `failed to upload data. <br />`;
          vm.loading = false;
        });
    },
    onInference: function () {
      this.$bvModal.show("inference");
    }
  },
  directives: {},
  mounted() {},
  updated() {
    var logsBox = this.$refs.logsBox;
    logsBox.scrollTop = logsBox.scrollHeight;
  },
  computed: {
    ...mapGetters([
      "getProjectDir",
      "getProjects",
      "getImages",
      "getProjectStatus",
      "getCmdVel",
    ]),
    trainable: function() {
      const regex = new RegExp(
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/
      );
      return this.url === "" || !regex.test(this.url) || this.loading;
    },
    variantType: function() {
      return this.isTraining ? "primary" : "outline-primary";
    },
    downloadable: function() {
      return this.isDone && !this.isDownloading;
    },
  },
};
</script>

<style lang="scss" scoped>
  $primary-color: #007e4e;
  .train-panel {
    padding: 20px;
    background: #222;
    height: 78px;
    display: flex;
    justify-content: flex-end;
  }
  .base-btn {
    color: white;
    background-color: $primary-color;
    margin-left: 10px !important;
    border-radius: 15px !important;
    width: 150px;
    &:disabled {
      opacity: 0.7;
    }
  }
  .train-pgr {
    border: none !important;
  }
  .scroll-box {
    height: calc(100vh - 78px);
    overflow-y: scroll;
    text-align: left;
    padding: 20px !important;
    background-color: #333 !important;
  }
  .display-screen {
    background-color: #333;
    margin: -31px -30px 0px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    height: 300px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .infer-class {
    margin: 0 -30px -30px -30px;
    padding: 20px;
    img {
      margin-right: 0.5em;
    }
    span {
      font-weight: 600;
    }
  }

</style>
