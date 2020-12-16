<template>
  <div class="w-100 h-100">
    <b-modal
      id="mfcc-annotate"
      centered
      title="SPECTROGRAM VIEW"
      modal-class="my-modal-class"
      :hide-footer="true"
    >
      <img
        :src="activeIndex.length > 0 ? getAudios[activeIndex[0]].mfcc : null"
        width="100%"
      />
    </b-modal>
    <b-modal
      ref="class-modal"
      id="anotate-audio-label"
      title="Add a label"
      modal-class="my-modal-class"
      hide-footer
    >
      <b-form @submit="onSubmit">
        <b-container fluid class="bv-example-row">
          <b-form-row class="mb-3">
            <b-form-input
              id="input-2"
              v-model="form.name"
              required
              placeholder="Enter name"
            ></b-form-input>
          </b-form-row>
          <b-form-row>
            <b-col md="4">
              <b-button pill block type="submit" variant="primary">Ok</b-button>
            </b-col>
          </b-form-row>
        </b-container>
      </b-form>
    </b-modal>
    <div class="d-flex w-100 h-100 outer-wrap">
      <div
        class="d-flex flex-fill flex-column main-panel"
        style="background-color: white"
      >
        <div class="recorder-container d-flex align-items-center">
          <div style="width: 100%" v-if="renderComponent">
            <WaveSurfer
              :src="selectedAudio"
              :options="optionsForMain"
              :play="activeIndex.length > 0 && isPlaying === activeIndex[0]"
              :onEnd="togglePlay"
              :onSetCurrent="onSetCurrent"
              :onSetDuration="onSetDuration"
            />
           <div
            v-if="renderComponent && activeIndex.length > 0"
            style="
              position: absolute;
              right: 1em;
              bottom: 1em;
              z-index: 99;
              display: flex;
            "
          >
            <div class="span-label">
              <img
                src="../assets/UI/svg/volume-up.svg"
                height="16"
                class="op-btn"
              />
              <b-form-input
                type="range"
                v-model="volume"
                min="0"
                max="1"
                step="0.1"
              ></b-form-input>
            </div>
            <div class="span-label">
              <p>
                {{ timeCurrent ? timeCurrent : "0:00" }} / {{ timeDuration }}
              </p>
            </div>
          </div>
          </div>
        </div>
        <div v-if="getAudios.length > 0" style="padding: 1em; overflow-y: auto;">
          <div v-for="(item, idx) in getAudios" :key="idx">
            <div
              :class="[
                activeIndex.includes(idx) ? 'audio-item-selected' : '',
                'audio-item d-flex align-items-center justify-content-between',
              ]"
              :id="idx"
              @click.exact="onSelect($event)"
              @click.shift="onSelectMulti($event)"
            >
              <div class="waveform-container">
                <WaveSurfer :src="item.wav" :options="options" :play="false" />
              </div>
              <div class="d-flex align-items-center">
                <div class="tag-annotate" v-show="item.isAnnotated">
                  <img src="../assets/UI/svg/Group 177_green.svg" height="16" />
                </div>
                <div class="audio-actions">
                  <img
                    @click="openMFCC($event, idx)"
                    src="../assets/UI/svg/wave-icon.svg"
                    height="20"
                    class="op-btn"
                  />
                  <img
                    src="../assets/UI/svg/pause-icon.svg"
                    v-if="isPlaying === idx"
                    height="20"
                    class="op-btn"
                    @click="togglePlay($event, -1)"
                  />
                  <img
                    src="../assets/UI/svg/play-icon.svg"
                    v-else
                    height="20"
                    class="op-btn"
                    @click="togglePlay($event, idx)"
                  />
                </div>
                <img
                  src="../assets/UI/svg/cancel-icon.svg"
                  height="32"
                  class="op-btn"
                  @click="deleteSound($event, idx)"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="d-flex flex-fill align-items-center justify-content-center"
        >
          <div class="text-center">
            <img src="../assets/UI/png/run.png" width="200" />
            <p>
              No Record yet, please use record button <br />
              to record set of data
            </p>
          </div>
        </div>
      </div>
      <div class="side-panel">
        <div class="w-100">
          <h4 class="side-panel-ttl">Selected Media</h4>
          <div class="feature-wrap">
            <p class="number-selected">{{ activeIndex.length }} media selected</p>
          </div>
          <h4 class="side-panel-ttl">Label</h4>
          <div class="feature-wrap">
            <b-btn class="btn btn-light new-label w-100" @click="onNewLabel">
              new label
              <img src="../assets/UI/png/+.png" alt="" style="position: absolute;right: 15px;" srcset="" />
            </b-btn>
            <div class="pills w-100">
              <div v-for="(item, idx) in getAudiosClasses" :key="idx">
                <button
                  class="btn added-label w-100"
                  @click="onLabelSound(item.label)"
                  >{{ item.label }}
                  <div style="position: absolute;right: 15px;" class="right-group">
                      <img class="ml-2" src="../assets/UI/png/Group 114.png" height="22" alt="" srcset="" />
                  </div>
                </button>
              </div>
              <!--<div>
                <button
                  class="btn added-label w-100"
                  >test<div style="position: absolute;right: 15px;" class="right-group">
                      <img class="ml-2" src="../assets/UI/png/Group 114.png" height="22" alt="" srcset="" />
                  </div>
                </button>
              </div>-->
            </div>
          </div>
          <h4 class="side-panel-ttl">Annotate</h4>
          <div class="feature-wrap">
            <div class="annotate-cn-list w-100">
              <div class="annotate-cn" v-for="(item, idx) in currentAnnotate" :key="idx">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">{{ item }}</span>
                  <!--<img
                    class="delete"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                    @click="onRemoveLabelSound"
                  />-->
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                    @click="onRemoveLabelSound"
                  />
                </div>
              </div>
              <!--
              <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">Design test</span>
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                  />
                </div>
              </div>
              <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">Design test</span>
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                  />
                </div>
              </div>
              <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">Design test</span>
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                  />
                </div>
              </div>
              <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">Design test</span>
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                  />
                </div>
              </div>
              <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">Design test</span>
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                  />
                </div>
              </div>
              <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">Design test</span>
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                  />
                </div>
              </div>
              <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">Design test</span>
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                  />
                </div>
              </div>
              <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24" />
                  <span class="annotation-txt">Design test</span>
                  <img
                    class="cancel-btn op-btn"
                    src="../assets/UI/svg/cancel-icon.svg"
                    height="24"
                  />
                </div>
              </div>
              -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import "vue-awesome/icons";
import { mapGetters } from "vuex";
import WaveSurfer from "@/components/waveSurfer.vue";

var axios_options = {
  proxy: {
    host: "127.0.0.1",
    port: 3000,
  },
};

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`,
});

export default {
  name: "Record",
  props: {},
  created() {},
  components: {
    WaveSurfer,
  },
  data() {
    return {
      activeIndex: [],
      selectedAudio: null,
      selectedAudioMFCC: null,
      isRecording: false,
      countDown: 3,
      duration: 3,
      delay: 1000,
      timeSpent: 0,
      options: {
        interact: false,
        barHeight: 20,
        waveColor: "#FFF",
        height: 40,
        maxCanvasWidth: 400,
      },
      optionsForMain: {
        waveColor: "#FFFFFF",
        progressColor: "#007E4E",
        cursorColor: "transparent",
        cursorWidth: 1,
        height: 200,
      },
      renderComponent: true,
      renderComponentItem: true,
      isPlaying: -1,
      form: {
        name: "",
      },
      currentAnnotate: [],
      timeCurrent: null,
      timeDuration: null,
    };
  },
  methods: {
    openMFCC(event, idx) {
      if (this.activeIndex[0] === idx) {
        event.stopPropagation();
      }
      this.$bvModal.show("mfcc-annotate");
    },
    togglePlay(event, index) {
      if (this.activeIndex[0] === index) {
        event.stopPropagation();
      }
      this.isPlaying = index;
    },
    countDownTimer() {
      if (this.countDown > 0) {
        setTimeout(() => {
          this.countDown -= 1;
          this.countDownTimer();
        }, 1000);
      } else {
        this.recordByRobot();
      }
    },
    countTimer() {
      setTimeout(() => {
        this.timeSpent += 1;
        this.countTimer();
      }, 1000);
    },
    recordByRobot() {
      this.countTimer();
      axiosInstance
        .post("/robot/record", {
          project: this.getProjectDir,
          duration: parseInt(this.duration),
          delay: parseInt(this.delay) / 1000,
        })
        .then((response) => {
          console.log(response.data);
        });
      console.log("Recording");
    },
    stopRecordByRobot() {
      axiosInstance.post("/robot/record/stop").then((response) => {
        console.log(response.data);
      });
      console.log("Stop recording");
    },
    onRecord() {
      if (this.isRecording) {
        // start recording here
        this.isRecording = false;
        this.stopRecordByRobot();
        this.countDown = 3;
        this.timeSpent = 0;
      } else {
        this.isRecording = true;
        this.countDownTimer();
      }
    },
    deleteSound: function (event, index) {
      event.stopPropagation();
      axiosInstance
        .delete(`/wav/${this.getProjectDir}/${this.getAudios[index].fileName}`)
        .then(() => {
          console.log("Sound has been deleted");
          this.$store.dispatch("reqAudios");
        });
    },
    onSelect: function (event) {
      var targetId = event.currentTarget.id;
      var index = Number(targetId);
      if (this.activeIndex.length === 1 && this.activeIndex.includes(index))
        this.activeIndex = [];
      else this.activeIndex = [index];
    },
    onSelectMulti: function (event) {
      var targetId = event.currentTarget.id;
      var index = Number(targetId);
      var currentIdx = this.activeIndex.indexOf(index);
      if (currentIdx !== -1)
        this.activeIndex = this.activeIndex.filter(
          (_, idx) => idx !== currentIdx
        );
      else this.activeIndex = [...this.activeIndex, index];
    },
    forceRerender() {
      // Remove my-component from the DOM
      this.renderComponent = false;

      this.$nextTick(() => {
        // Add the component back in
        this.renderComponent = true;
      });
    },
    onNewLabel: function () {
      this.$refs["class-modal"].show();
    },
    onSubmit(evt) {
      evt.preventDefault();

      axiosInstance
        .put(`/wav/${this.getProjectDir}/class`, {
          label: this.form.name,
        })
        .then((response) => {
          if (!response.data.status) {
            this.$store.dispatch("setAudiosClasses", response.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      this.$refs["class-modal"].hide();
    },
    onLabelSound: function (label) {
      const file = this.activeIndex.map(
        (selected) => this.getAudios[selected].fileName
      );
      axiosInstance
        .post(`/wav/${this.getProjectDir}/label`, { label, file })
        .then((response) => {
          if (response.data.status === "success") {
            this.$store.dispatch("reqAudios");
            this.currentAnnotate = [label];
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    onRemoveLabelSound: function () {
      const file = this.getAudios[this.activeIndex[0]].fileName;
      axiosInstance
        .delete(`/wav/${this.getProjectDir}/label/${file}`)
        .then((response) => {
          if (response.data.status === "success") {
            this.currentAnnotate = [];
            this.$store.dispatch("reqAudios");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    onSetCurrent: function (time) {
      this.timeCurrent = time;
    },
    onSetDuration: function (time) {
      this.timeDuration = time;
    },
  },

  directives: {},

  mounted() {
    axiosInstance.get("getIP", axios_options).then((response) => {
      this.ipAddress = response.data.IP;
      this.imgSrc =
        "http://" +
        this.ipAddress +
        ":8080/stream?topic=/output/image_raw&type=ros_compressed";
    });

    console.log("Started roslibjs");
  },
  computed: {
    ...mapGetters(["getProjectDir", "getAudios", "getAudiosClasses"]),
    importProgressFile: function () {
      return `${this.importDone} / ${this.import.length}`;
    },
    importProgressPercent: function () {
      return this.import.length > 0
        ? Math.round((this.importDone / this.import.length) * 100)
        : 0;
    },
    importShow: function () {
      return this.import.length === 0;
    },
    countingTime: function () {
      return this.countDown;
    },
    countingTimeUp: function () {
      return `${String(Math.floor(this.timeSpent / 3600) % 24).padStart(
        2,
        "0"
      )}:${String(Math.floor(this.timeSpent / 60) % 60).padStart(
        2,
        "0"
      )}:${String(this.timeSpent % 60).padStart(2, "0")}`;
    },
    currentAudio: function () {
      return typeof this.activeIndex !== "undefined"
        ? this.getAudios[this.activeIndex].wav
        : null;
    },
    //getProjectDir() {
    //    return this.$store.state.projectDir
    //}
  },
  watch: {
    camera: function (id) {
      this.deviceId = id;
    },
    devices: function () {
      // Once we have a list select the first one
      // eslint-disable-next-line no-unused-vars
      const [first, ...tail] = this.devices;
      if (first) {
        this.camera = first.deviceId;
        this.deviceId = first.deviceId;
      }
    },
    isCameraOpen: function (value) {
      // console.log(value)
      if (!value) this.onStop();
      else this.onStart();
    },
    activeIndex: {
      deep: true,
      handler: function (index) {
        var l = index.length;
        if (l > 0) {
          this.selectedAudio = this.getAudios[index[0]].wav;
          if (this.getAudios[index[0]].class !== "none") {
            this.currentAnnotate = [this.getAudios[index[0]].class];
          } else {
            this.currentAnnotate = [];
          }
          // this.selectedAudioMFCC = this.getAudios[index[-1]].mfcc
        } else {
          this.currentAnnotate = [];
        }
      },
    },
    selectedAudio: function () {
      this.forceRerender();
    },
  },
};
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.pills {
    overflow-y: auto;
}

.annotate-cn-list {
    overflow-y: auto;
}

.annotate-cn {
  text-align: left;
  background-color: #ddd;
  border-radius: 23px;
  position: relative;
  margin-bottom: 10px;
  opacity: 0.7;
  border: 5px solid #aaa;
  cursor: pointer;
  transition: opacity 0.3s ease-in;
  overflow: hidden;

  .annotate-cn-list-ttl {
    background-color: #aaa;
    padding: 5px 32px 5px 10px;
    img {
      width: 30px;
      height: 30px;
      &:last-child {
        display: none;
      }
    }
  }

  .annotate-cn-list-content {
    display: flex;
    padding: 15px 10px;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .tag {
      margin-right: 5px;
    }
  }

  .annotation-txt {
    color: $primary-color;
    font-size: 1.3rem;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.active {
    border: 5px solid $primary-color;
    opacity: 1;

    .annotate-cn-list-ttl {
      background-color: $primary-color;
      color: #fff;
      img {
        &:first-child {
          display: none;
        }
        &:last-child {
          display: inline-block;
        }
      }
    }
  }

  &:hover {
    opacity: 1;
  }
}

.badge-icn {
  position: absolute;
  left: 10px;
  top: 10px;
  background-color: $primary-color;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.cancel-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  cursor: pointer;
}

.tag-annotate {
  border-radius: 50%;
  background: white;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.3em;
}

.added-label {
  position: relative;
  border-radius: 16px;
  text-align: left;
  background-color: #dddddd;
  border: 1px solid #ddd;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 8px 80px 8px 20px;

  &.active {
    background-color: $primary-color;
    color: white;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.right-group {
  position: absolute;
  right: 15px;
  top: 0;
  bottom: 0;
  display: flex;
  vertical-align: middle;
  align-items: center;
}

.new-label {
  position: relative;
  border-radius: 16px;
  text-align: left;
  color: $primary-color;
  margin-bottom: 10px;
}

.side-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px;
  overflow-y: auto;

  .side-panel-ttl {
      color: $primary-color;
      font-weight: bold;
      background: #CDCDCD;
      padding: 10px 20px;
      margin-bottom: 10px;
  }
  .feature-wrap {
      padding: 0 20px 10px;
  }

  h5 {
    color: #007e4e;
    text-transform: uppercase;
    background: #cdcdcd;
    padding: 0.5em;
  }
  .number-selected {
    padding: 0.5em 1em;
    //margin: 0 1em;
    background: #007e4e;
    border-radius: 20px;
    color: white;
    margin-bottom: 0.5em;
  }
  .annotate-box {
    border: 5px solid #007e4e;
    padding: 1.2em 1em;
    font-size: 18px;
    margin: 0 1em;
    color: #003722;
    border-radius: 20px;
    position: relative;
    margin-bottom: 0.3em;
    img.tag {
      margin-right: 0.5em;
    }
    img.delete {
      position: absolute;
      right: -9px;
      top: -12px;
    }
  }
  .item {
    &:first-of-type {
      margin-top: 1em;
    }
    display: flex;
    padding: 0 2em;
    align-items: center;
    margin-bottom: 0.5em;
    color: #333333;
    input {
      border-radius: 0.7em;
      border: none;
      padding: 0.2em;
      text-indent: 0.5em;
      margin: 0 1em;
      width: 100px;
      text-align: end;
    }
    p {
      margin: 0;
      width: 50px;
    }
  }

  .side-header {
    width: 100%;
    button {
      padding: 0.5em 1em;
      margin: 0 1em;
      background: #ffffff;
      border-radius: 20px;
      color: #007e4e;
      margin-bottom: 0.5em;
      border: none;
      width: calc(100% - 2em);
      width: 100%;
    }
    button.label {
      background: #e6e6e6;
      color: #333333;
    }
  }

  .next {
    height: 50px;
    background: #ffffff 0% 0% no-repeat padding-box;
    border-radius: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 15px;

    span {
      color: $primary-color;
      font-size: 1.5rem;
      font-weight: 800;

      &.ico {
        position: absolute;
        top: 7px;
        right: 18px;
      }
    }
  }
}

#logo .fa-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.btn-space {
  margin-right: 5px;
}

.outer-wrap {
  overflow: hidden;
}

.main-panel {
  width: calc(100% - 300px);
}

.img-slider {
  display: -webkit-box;
  width: calc(100% - 40px);
  overflow-x: scroll;
  height: 180px;
  position: relative;
  padding-top: 6px;
  margin: 20px;

  .img {
    background-color: #2f3241;
    height: 160px;
    width: 160px;
    margin: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    opacity: 0.7;
    transition: opacity 0.3s ease-in;
    cursor: pointer;

    &.active,
    &:hover {
      opacity: 1;
    }

    &.active::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border: 7px solid $primary-color;
      border-radius: 20px;
      pointer-events: none;
    }

    .thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .cancel-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 30px;
    height: 30px;
  }
}
.display-panel {
  border-radius: 8px;
  background-color: #333;
  overflow: hidden;
  margin-top: 15px;

  .display-image {
    margin: 0;
    canvas {
      min-height: 180px;
      height: 180px;
      width: 100%;
      object-fit: cover;
    }
  }
}
.recorder-container {
  background: #333333;
  width: 100%;
  height: 250px;
  position: relative;
  .recorder-wrap {
    display: flex;
    align-items: center;
    position: absolute;
    bottom: 30px;
    right: 30px;
    z-index: 1;
    .vol-adj {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      margin-right: 10px;
    }
    .time-counter {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      span {
        font-weight: bold;
      }
      .current-time {
        color: $primary-color;
        padding-right: 5px;
      }
    }
    .rec-counter {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      color: $primary-color;
      font-weight: bold;
      text-transform: uppercase;
    }
  }
}
.bottom-action {
  margin-bottom: 2em;
}
.audio-item {
  background: #cccccc;
  padding: 0.5em 1em;
  border-radius: 20px;
  margin-bottom: 0.7em;
  cursor: pointer;
  .waveform-container {
    border-radius: 20px;
    overflow: hidden;
    width: 80%;
  }
  .audio-actions {
    background: #ffffff;
    padding: 0.3em 0.8em;
    border-radius: 15px;
    margin-right: 0.3em;
    img {
      &:first-of-type {
        margin-right: 0.8em;
      }
    }
  }
}
.audio-item-selected {
  background: #007e4e;
}

.span-label {
  color: #6b6b6b;
  text-align: center;
  padding: 0.5em 1em;
  background: white;
  border-radius: 22px;
  font-size: 14px;
  display: flex;
  align-items: center;
  &:first-of-type {
    margin-right: 0.5em;
  }

  img {
    margin-right: .3em;
  }
  p {
    margin: 0;
  }
  input[type="range"] {
    width: 60px;
  }
}
</style>
