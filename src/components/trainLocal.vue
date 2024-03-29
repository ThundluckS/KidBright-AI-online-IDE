<template>
  <div style="height: 100vh; width: 100vw;">
    <b-input-group class="train-panel">
      <b-input-group-append>
        <div class="btn-wrap">
          <button class="btn base-btn" :disabled="trainable" @click="isModified ? onTrainCustom() : onTrain()">
            <b-spinner v-if="loading" small type="grow"></b-spinner>
            {{ isTraining ? 'Training' : (isDone ? 'Train Complete' : 'Train') }}
          </button>
          <div class="setting" v-b-modal.modify>
            <img class="tag" src="../assets/UI/svg/settings.svg" height="24" />
          </div>
        </div>
        <button class="btn base-btn" @click="onInference">
          Test
        </button>
        <button class="btn base-btn" @click="isModified ? onDownload() : download()">
          <b-spinner v-if="isDownloading" small type="grow"></b-spinner>
          Download
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
   <b-modal
      id="modify"
      centered
      title="Parameter Settings"
      modal-class="my-modal-class my-modal-class-no-pad"
      :hide-footer="true"
      size="xl"
    >
      <CNN :callback="onModify" />
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";
import CNN from "@/components/cnn.vue";

var initial_model_params = [
  {
    type: "CNN2D",
    filters: "32",
    kernel_size: "(2,2)",
    strides: "(1,1)",
    padding: "same",
    dilation_rate: "(1,1)",
    activation: "relu",
    use_bias: "True",
  },
  {
    type: "MaxPool2D",
    pool_size: "(2,2)",
    strides: "None",
    padding: "same",
  },
  {
    type: "CNN2D",
    filters: "32",
    kernel_size: "(2,2)",
    strides: "(1,1)",
    padding: "same",
    dilation_rate: "(1,1)",
    activation: "relu",
    use_bias: "True",
  },
  {
    type: "MaxPool2D",
    pool_size: "(2,2)",
    strides: "None",
    padding: "same",
  },
  {
    type: "CNN2D",
    filters: "64",
    kernel_size: "(2,2)",
    strides: "(1,1)",
    padding: "same",
    dilation_rate: "(1,1)",
    activation: "relu",
    use_bias: "True",
  },
  {
    type: "MaxPool2D",
    pool_size: "(2,2)",
    strides: "None",
    padding: "same",
  },
  {
    type: "Flatten",
  },
  {
    type: "Dense",
    units: "64",
    activation: "relu",
    use_bias: "True",
  },
  {
    type: "Dropout",
    remove_prob: "0.5",
  },
  {
    type: "Dense",
    units: "2",
    activation: "softmax",
    use_bias: "True",
  },
];

const initial_training_params = {
  epochs: "100",
  learning_rate: "1e-4",
  optimizer: "rmsprop",
  batch_size: "32",
  loss: "categorical_crossentropy",
  save_best_only: "True",
  monitor: "val_accuracy",
  mode: "max",
};

var axios_options = {
  proxy: {
    host: "127.0.0.1",
    port: 3000,
  },
};

axios.defaults.timeout = 300000;

var trainInstanceOld = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:8001`,
});

var trainInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:8000`,
});

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}/server`,
});

export default {
  name: "Training",
  components: {
    CNN,
  },
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
      std_out_topic: undefined,
      std_out_message: "",
      isInfered: false,
      selectedInfer: null,
      inferClass: "",
      isModified: false,
      modifiedModel: [],
      modifiedTraining: null,
    };
  },
  methods: {
    prepareData: function () {
      this.result += `Preparing data ... <br />`;
      return axiosInstance.get(`/archiveForClassify/${this.getProjectDir}`);
    },
    checkRunningOld: function () {
      return trainInstanceOld.get(`/train/is_running`);
    },
    stopTrainingOld: function () {
      return trainInstanceOld.get(`/train/stop`);
    },
    getLogsOld: function () {
      return trainInstanceOld.get(`/train/log`);
    },
     checkRunning: function () {
      return trainInstance.get("/is_training");
    },
    stopTraining: function () {
      return trainInstance.post("/stop_training");
    },
    getLogs: function () {
      return trainInstance.get("/log_training");
    },
    onClickHandler(e) {
      this.isInfered = false;
      if (e.target !== e.currentTarget) {
        this.import = [];
        this.importDone = 0;
        e.currentTarget.click();
      }
    },
    handleFileUpload() {
      const files = Array.from(this.$refs.import.files);
      if (files.length > 0) {
        this.submitFile(files[0]);
      }
    },
    submitFile(img) {
      this.selectedInfer = URL.createObjectURL(img);
      let formData = new FormData();
      formData.append("file", img);
      let self = this;
      trainInstance
        .post(`/inference`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(function (response) {
          self.isInfered = true;
          self.inferClass = response.data;
        })
        .catch(function () {
          console.log("FAILURE!!");
        });
    },
    onResetModal() {
      this.isInfered = false;
    },
    download: async function () {
      console.log(this.isModified)
      this.isDownloading = true;
      try {
        const res = await axiosInstance.post(`/downloadClassifier`, {
          projectName: this.getProjectDir,
        });
        if (res) {
          if (res.data.status === "error") {
            this.$bvToast.toast(res.data.message, {
              title: "Error!",
              autoHideDelay: 3000,
            });
          } else if (res.data.status === "success") {
            this.$bvToast.toast(res.data.message, {
              title: "Success!",
              autoHideDelay: 3000,
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
      this.isDownloading = false;
    },
    onDownload: async function () {
      this.isDownloading = true;
      try {
        const res = await axiosInstance.post(
          `/img/${this.getProjectDir}/model/download`,
          {
            filename: "model.h5",
          }
        );
        if (res) {
          if (res.data.status === "error") {
            this.$bvToast.toast(res.data.message, {
              title: "Error!",
              autoHideDelay: 3000,
            });
          } else if (res.data.status === "success") {
            this.$bvToast.toast(res.data.message, {
              title: "Success!",
              autoHideDelay: 3000,
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
      this.isDownloading = false;
    },
    onTrain: async function () {
      this.loading = true;
      this.isDone = false;
      this.isTraining = false;
      this.result = "";
      this.logs = "";
      try {
        const data = await this.prepareData();
        this.result += `Successfully prepare data. <br />`;
        let formData = new FormData();
        formData.append("zip_filepath", data.data.path);
        let vm = this;
        trainInstanceOld
          .post(`/upload`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(function (res) {
            vm.result += `${res.data} <br />`;
            vm.isTraining = true;
            const polling = setInterval(async () => {
              const res = await vm.checkRunningOld();
              const log = await vm.getLogsOld();
              vm.logs = log.data
                .replace(/(?:\r\n|\r|\n)/g, "<br>")
                .replace(/\d+/gm, "");
              if (res.data === "False") {
                vm.loading = false;
                vm.isTraining = false;
                vm.isDone = true;
                clearInterval(polling);
              }
            }, 3000);
          })
          .catch(function (e) {
            console.error(e);
            vm.result += `failed to upload data. <br />`;
            vm.loading = false;
          });
      } catch (e) {
        if (e.response.status === 404) {
          this.$bvToast.toast("Cannot get classification labels!", {
            title: "Error!",
            autoHideDelay: 3000,
          });
        } else {
          this.$bvToast.toast("Something went wrong!", {
            title: "Error!",
            autoHideDelay: 3000,
          });
        }
        this.loading = false;
        this.isTraining = false;
        console.log(e);
      }
    },
    onTrainCustom: async function () {

      this.loading = true;
      this.isDone = false;
      this.isTraining = false;
      this.result = "";
      this.logs = "";

      try {
        const data = await this.prepareData();
        this.result += `Successfully prepare data. <br />`;
        let formData = new FormData();
        formData.append("zip_filepath", data.data.path);
        formData.append("feature_sets_filename", "feature_sets.npz");
        formData.append("model_filename", "model.h5");
        formData.append("wake_word", this.wanted_word);
        formData.append("is_image", "True");
        formData.append("model_param", JSON.stringify(this.modifiedModel));
        formData.append("training_param", JSON.stringify(this.modifiedTraining));
        formData.append("val_ratio", "0.1");
        formData.append("test_ratio", "0.1");
        let vm = this;
        trainInstance
          .post(`/upload_and_train`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(function (res) {
            vm.modelPath = res.data;
            // vm.result += `Training... <br />`;
            vm.isTraining = true;
            const polling = setInterval(async () => {
              const res = await vm.checkRunning();
              const log = await vm.getLogs();
              vm.logs = `${log.data}`.replace(/(?:\r\n|\r|\n)/g, "<br>");
              // .replace(/\d+/gm, "");
              if (res.data === "False") {
                vm.loading = false;
                vm.isDone = true;
                vm.isTraining = false;
                clearInterval(polling);
              }
            }, 3000);
          })
          .catch(function (e) {
            console.error(e);
            vm.result += `failed to upload data. <br />`;
            vm.loading = false;
          });
      } catch (e) {
        if (e.response.status === 404) {
          this.$bvToast.toast("Cannot get classification labels!", {
            title: "Error!",
            autoHideDelay: 3000,
          });
        } else {
          this.$bvToast.toast("Something went wrong!", {
            title: "Error!",
            autoHideDelay: 3000,
          });
        }
        this.loading = false;
        this.isTraining = false;
        console.log(e);
      }
    },
    onModify: function (data) {
      const { model, ...training } = data;
      this.modifiedModel = model;
      this.modifiedTraining = training;
      this.isModified = true;
      this.$bvModal.hide("modify");
    },
    onInference: function () {
      this.$bvModal.show("inference");
    }
  },
  directives: {},
  mounted() {
    //console.log(this.rbServer)
  },
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
    trainable: function () {
      return this.loading;
    },
    variantType: function () {
      return this.isTraining ? "primary" : "outline-primary";
    },
    downloadable: function () {
      return this.isDone && !this.isDownloading;
    },
    selectedInferSrc: function () {
      return this.selectedInfer;
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
.btn-wrap {
  display: flex;
  .base-btn {
    border-radius: 15px 0 0 15px !important;
  }
  .setting {
    background-color: #005534;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    border-radius: 0 15px 15px 0;
    &:hover {
      img {
        opacity: 0.8;
      }
    }
  }
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
.train-setting {
  input {
    margin-bottom: 10px;
  }
  .btn {
    background-color: #eee;
  }
  .adv {
    margin-bottom: 10px;
  }
  .modal-check {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    input {
      width: 20px;
      height: 20px;
      margin-right: 5px;
    }
  }
  .modal-action-btn {
    display: flex;
    justify-content: flex-end;
    .save {
      background-color: $primary-color;
      color: #ffffff;
      margin-left: 10px;
    }
  }
}
</style>
