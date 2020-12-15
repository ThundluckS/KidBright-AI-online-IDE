<template>
  <div style="height: 100vh; width: 100vw">
    <div class="train-panel">
      <button class="btn base-btn" v-b-modal.setting>
        Model Classification Setting
      </button>
      <button
        :class="['btn base-btn', isDone ? 'btn-red' : '']"
        :disabled="trainable || !wanted_word"
        @click="onTrain()"
      >
        <b-spinner v-if="loading" small type="grow"></b-spinner>
        {{ isTraining ? "Training" : isDone ? "Train Complete" : "Train" }}
      </button>
      <button class="btn base-btn" :disabled="!isDone" @click="onInference">
        Test
      </button>
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
      title="MODEL CLASSIFICATION"
      modal-class="my-modal-class"
      :hide-footer="true"
    >
      <label for="wanted-word">Wanted word:</label>
      <b-form-select
        id="wanted-word"
        :options="options"
        v-model="wanted_word"
      ></b-form-select>
      <label for="learning-rate" class="mt-2">Learning rate:</label>
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
      ></b-form-input>
      <label for="threshold" class="mt-2">Training step:</label>
      <b-form-input
        id="threshold"
        type="number"
        min="0"
        max="1"
        step="0.01"
        v-model="categorical_threshold"
      ></b-form-input>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";
import WaveForm from "@/components/waveForm.vue";

axios.defaults.timeout = 300000;

var trainInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:8000`,
});

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3001`,
});

const initial_model_params = [
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
      wanted_word: null,
      learning_rate: 0.0001,
      epochs: 10,
      categorical_threshold: 0.5
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
          { filename: "model.h5" }
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
        formData.append("feature_sets_filename", "feature_sets.npz");
        formData.append("model_filename", "model.h5");
        formData.append("wake_word", this.wanted_word);
        formData.append("is_image", "");
        formData.append("model_param", JSON.stringify(initial_model_params));
        formData.append(
          "training_param",
          JSON.stringify({
            ...initial_training_params,
            learning_rate: `${this.learning_rate}`,
            epochs: `${this.epochs}`,
          })
        );
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
    onInference: function () {
      let formData = new FormData();
      formData.append("num_frame", "12");
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
</style>
