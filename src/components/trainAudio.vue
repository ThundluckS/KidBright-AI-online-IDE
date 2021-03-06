<template>
  <div style="height: 100vh; width: 100vw">
    <div class="train-panel">
      <div class="btn-wrap">
        <button
          :class="['btn base-btn', isDone ? 'btn-red' : '']"
          :disabled="trainable"
          @click="onTrain()"
        >
          <b-spinner v-if="loading" small type="grow"></b-spinner>
          {{ isTraining ? "Training" : isDone ? "Train Complete" : "Train" }}
        </button>
        <div class="setting" v-b-modal.modify>
          <img class="tag" src="../assets/UI/svg/settings.svg" height="24" />
        </div>
      </div>
      <div class="btn-wrap">
        <button class="btn base-btn" :disabled="!isDone" @click="onInference">
          Test
        </button>
        <div class="setting" v-b-modal.setting>
          <img class="tag" src="../assets/UI/svg/settings.svg" height="24" />
        </div>
      </div>

      <button class="btn base-btn" :disabled="!isDone" @click="onDownload">
        <b-spinner v-if="isDownloading" small type="grow"></b-spinner>
        Download
      </button>
    </div>
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
      @hidden="stopInference"
    >
      <WaveForm :data="getRealtimeSound" />
      <div class="infer-class">
        <img
          class="tag"
          src="../assets/UI/svg/Group 177_green.svg"
          height="24"
        />
        <span>{{ getInference }}</span>
      </div>
    </b-modal>
    <b-modal
      id="setting"
      centered
      title="Test Parameters"
      modal-class="my-modal-class"
      :hide-footer="true"
    >
      <!-- <label for="learning-rate" class="mt-2">Learning rate:</label>
      <b-form-input
        id="learning-rate"
        type="number"
        min="0"
        max="1"
        step="0.0000001"
        v-model="learning_rate"
      ></b-form-input>
      <label for="training-step" class="mt-2">Training step:</label>
      <b-form-input
        id="training-step"
        type="number"
        min="0"
        step="1"
        v-model="epochs"
      ></b-form-input> -->
      <label for="threshold" class="mt-2">Testing threshold:</label>
      <b-form-input
        id="threshold"
        type="number"
        min="0"
        max="1"
        step="0.01"
        v-model="categorical_threshold"
      ></b-form-input>
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
import WaveForm from "@/components/waveForm.vue";
import CNN from "@/components/cnn.vue";

axios.defaults.timeout = 300000;

var trainInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:8000`,
});

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`,
});

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

export default {
  name: "Training",
  components: {
    WaveForm,
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
      modelPath: null,
      threshold: 0.8,
      wanted_word: "",
      learning_rate: 0.0001,
      epochs: 10,
      categorical_threshold: 0.5,
      isModified: false,
      modifiedModel: [],
      modifiedTraining: null,
    };
  },
  methods: {
    prepareData: function () {
      this.result += `Preparing data ... <br />`;
      return axiosInstance.post(`/wav/${this.getProjectDir}/archive`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
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
    onDownload: async function () {
      this.isDownloading = true;
      try {
        const res = await axiosInstance.post(
          `/wav/${this.getProjectDir}/model/download`,
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
      var model = initial_model_params;
      var training = initial_training_params;
      if (!this.isModified) {
        model[model.length - 1].units = this.getAudiosClasses.length;
      } else {
        model = this.modifiedModel;
        training = this.modifiedTraining;
      }

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
        formData.append("is_image", "");
        formData.append("model_param", JSON.stringify(model));
        formData.append("training_param", JSON.stringify(training));
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
      let formData = new FormData();
      formData.append("num_frame", `${this.getProjDescription.Duration * 4}`);
      formData.append("model_file", this.modelPath);
      formData.append("output_type", "categorical_crossentropy");
      formData.append("categorical_threshold", this.categorical_threshold);
      trainInstance
        .post(`/inference`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          this.$bvModal.show("inference");
        });
    },
    stopInference: function () {
      trainInstance.post("/stop_inference");
    },
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
      "getRealtimeSound",
      "getInference",
      "getAudiosClasses",
      "getProjDescription",
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
    options: function () {
      return this.getAudiosClasses.map((item) => ({
        value: item.label,
        text: item.label,
      }));
    },
  },
  watch: {
    getAudiosClasses: function (value) {
      if (value.length > 0) {
        this.wanted_word = value[0];
      }
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
  border-radius: 10px !important;

  &:disabled {
    opacity: 0.7;
  }
}

.btn-red {
  background-color: #f15249 !important;
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

.infer-class {
  margin: 1em 0 0 0;

  img {
    margin-right: 0.5em;
  }

  span {
    font-weight: 600;
  }
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
</style>
