<template>
  <div class="w-100 h-100">
    <b-modal
      id="mfcc"
      centered
      title="SPECTROGRAM VIEW"
      modal-class="my-modal-class"
      :hide-footer="true"
    >
      <img :src="selectedAudioMFCC" width="100%" />
    </b-modal>
    <div class="d-flex w-100 h-100 outer-wrap">
      <div
        class="d-flex flex-fill flex-column main-panel"
        style="background-color: white"
      >
        <div
          :class="[
            'recorder-container d-flex align-items-center',
            activeVoice ? 'recorder-container-active' : '',
          ]"
        >
          <p
            v-if="isRecording && countingTime > 0"
            style="
              color: #6b6b6b;
              width: 100%;
              text-align: center;
              font-size: 80px;
            "
          >
            {{ countingTime }}
          </p>
          <WaveForm
            v-if="isRecording && countingTime === 0"
            :data="getRealtimeSound"
          />
          <div
            style="width: 100%"
            v-if="!isRecording && renderComponent && activeIndex !== -1"
          >
            <WaveSurfer
              :src="selectedAudio"
              :options="optionsForMain"
              :play="isPlaying === activeIndex"
              :volume="volume"
              :onEnd="togglePlay"
              :onSetCurrent="onSetCurrent"
              :onSetDuration="onSetDuration"
            />
          </div>
          <div class="recorder-wrap" v-if="!isRecording && renderComponent">
            <div class="vol-adj d-flex" v-if="activeIndex !== -1">
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
            <div class="time-counter" v-if="activeIndex !== -1">
              <span class="current-time">{{
                timeCurrent ? timeCurrent : "0:00"
              }}</span
              ><span class="ov-time">/ {{ timeDuration }}</span>
            </div>
            <div class="rec-counter" v-if="activeIndex === -1">
              {{ getAudiosLength }} Records
            </div>
          </div>
        </div>
        <div v-if="getAudiosLength > 0" style="padding: 1em; overflow-y: auto">
          <div v-for="(item, idx) in getAudios" :key="idx">
            <div
              :class="[
                activeIndex === idx ? 'audio-item-selected' : '',
                'audio-item d-flex align-items-center justify-content-between',
              ]"
              :id="idx"
              @click="onSelect($event)"
            >
              <div class="waveform-container">
                <WaveSurfer :src="item.wav" :options="options" :play="false" />
              </div>
              <div class="audio-actions">
                <img
                  @click="openMFCC"
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
        <!--
        <div style="padding: 1em; overflow-y: auto;">
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
          <div>
            <div class="audio-item d-flex align-items-center justify-content-between" @click="onSelect($event)">
              <div class="waveform-container">wave test</div>
              <div class="audio-actions">
                <img @click="openMFCC" src="../assets/UI/svg/wave-icon.svg" height="20" class="op-btn" />
                <img src="../assets/UI/svg/pause-icon.svg" v-if="isPlaying === idx" height="20" class="op-btn" @click="togglePlay($event, -1)" />
                <img src="../assets/UI/svg/play-icon.svg" v-else height="20" class="op-btn" @click="togglePlay($event, idx)" />
              </div>
              <img src="../assets/UI/svg/cancel-icon.svg" height="32" class="op-btn" @click="deleteSound($event, idx)" />
            </div>
          </div>
        </div>
        -->
      </div>
      <div class="side-panel" style="width: 300px">
        <div class="w-100">
          <h5 class="side-panel-ttl">Recorder Settings</h5>
          <div class="feature-wrap">
            <div class="item">
              <p>Range</p>
              <input type="number" max="3" min="1" v-model="duration" />
              <p>sec.</p>
            </div>
            <div class="item">
              <p>Delay</p>
              <input type="number" min="0" v-model="delay" />
              <p>ms.</p>
            </div>
          </div>
        </div>
        <div class="center bottom-action">
          <img
            v-if="isRecording"
            class="camera-btn op-btn"
            src="../assets/UI/png/Group 169.png"
            height="96"
            alt=""
            srcset=""
            @click="onRecord"
          />
          <img
            v-else
            class="camera-btn op-btn"
            src="../assets/UI/png/Group 200.png"
            height="96"
            alt=""
            srcset=""
            @click="onRecord"
          />
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
import WaveForm from "@/components/waveForm.vue";

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
    WaveForm,
  },
  data() {
    return {
      ipAddress: "192.168.88.247",
      connected: "Disconnected",
      teleop: null,
      cmdVel: null,
      rbServer: null,
      imgSrc: null,
      projectDirIn: "",
      nameState: null,
      images: [],
      activeIndex: -1,
      selectedAudio: null,
      selectedAudioMFCC: null,
      showCapturing: false,
      camera: null,
      deviceId: null,
      devices: [],
      isCameraOpen: false,
      import: [],
      importDone: 0,
      uploadPercentage: 0,
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
      round: "first",
      timeInterval: null,
      activeVoice: false,
      timeCurrent: null,
      timeDuration: null,
      volume: 0.4,
    };
  },
  methods: {
    openMFCC() {
      this.$bvModal.show("mfcc");
    },
    togglePlay(event, index) {
      this.isPlaying = index;
    },
    countDownTimer() {
      if (this.countDown > 0) {
        setTimeout(() => {
          this.countDown -= 1;
          this.countDownTimer();
        }, 1000);
      } else {
        this.countTimer();
        this.recordByRobot();
        this.timeInterval = setInterval(() => {
          this.recordByRobot();
        }, parseInt(this.duration) * 1000 + parseInt(this.delay));
      }
    },
    countTimer() {
      setTimeout(() => {
        this.timeSpent += 1;
        this.countTimer();
      }, 1000);
    },
    recordByRobot() {
      axiosInstance.post("/robot/record", {
        project: this.getProjectDir,
        duration: parseInt(this.duration),
      });

      setTimeout(() => {
        this.activeVoice = true;
        setTimeout(() => {
          this.activeVoice = false;
        }, parseInt(parseInt(this.duration) * 1000));
      }, parseInt(1500));

      // deactive speaking

      // this.activeVoice = true;
      console.log("call robot record");
    },
    stopRecordByRobot() {
      // axiosInstance.post("/robot/record/stop").then((response) => {
      //   console.log(response.data);
      // });
      clearInterval(this.timeInterval);
      this.$store.dispatch("reqAudios");
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
      this.activeIndex = index;
    },
    forceRerender() {
      // Remove my-component from the DOM
      this.renderComponent = false;

      this.$nextTick(() => {
        // Add the component back in
        this.renderComponent = true;
      });
    },
    onSetCurrent: function (time) {
      this.timeCurrent = time;
    },
    onSetDuration: function (time) {
      this.timeDuration = time;
    },
  },
  mounted() {},
  computed: {
    ...mapGetters(["getProjectDir", "getAudios", "getRealtimeSound"]),
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
    getAudiosLength: function () {
      return this.getAudios.length;
    },
  },
  watch: {
    activeIndex: function (index) {
      if (typeof index !== "undefined") {
        this.selectedAudio = this.getAudios[index].wav;
        this.selectedAudioMFCC = this.getAudios[index].mfcc;
      }
    },
    selectedAudio: function (value) {
      this.forceRerender();
    },
    isPlaying: function (index) {
      if (index !== -1 && index !== this.activeIndex) {
        this.isPlaying = -1;
        this.activeIndex = index;
        this.$nextTick(() => (this.isPlaying = index));
      }
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

.side-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 300px;

  .side-panel-ttl {
    color: $primary-color;
    font-weight: bold;
    background: #cdcdcd;
    padding: 10px 20px;
    margin-bottom: 10px;
    width: 100%;
  }
  .feature-wrap {
    padding: 0 20px 10px;
    width: 100%;
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5em;
      color: #333333;
      &:first-of-type {
        margin-top: 1em;
      }
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
      display: flex;
      align-items: center;
      img {
        margin-right: 0.3em;
      }
      input[type="range"] {
        width: 60px;
      }
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
.recorder-container-active {
  border: 10px solid #007e4e !important;
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
    margin-right: 0.3em;
  }
  p {
    margin: 0;
  }
  input[type="range"] {
    width: 60px;
  }
}
</style>
