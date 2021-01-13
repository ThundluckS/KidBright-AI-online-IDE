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
          <div
            style="width: 100%; height: 100%"
            v-show="
              isRecording && countingTime === 0 && getActiveDevice !== 'robot'
            "
          >
            <canvas id="waveform-client"></canvas>
          </div>
          <WaveForm
            v-if="
              isRecording && countingTime === 0 && getActiveDevice === 'robot'
            "
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
        <div class="items-wrapper">
          <div
            v-if="getAudiosLength > 0 && forceItemRender"
            style="padding: 1em; overflow-y: auto"
          >
            <div v-for="(item, idx) in getAudios" :key="idx">
              <h5>{{item.fileName}}</h5>
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
                <div class="tag-annotate">
                  <img
                    v-show="idx !== 0"
                    src="../assets/UI/svg/angle-arrow-up.svg"
                    height="16"
                    @click="changeOrder(idx, -1)"
                  />
                  <img
                    v-show="idx !== getAudiosLength - 1"
                    src="../assets/UI/svg/angle-arrow-down.svg"
                    height="16"
                    @click="changeOrder(idx, 1)"
                  />
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
          <div
            v-else
            class="no-record d-flex flex-fill align-items-center justify-content-center"
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
      </div>
      <div class="side-panel" style="width: 300px">
        <div class="w-100">
          <h5 class="side-panel-ttl">Recorder Settings</h5>
          <div class="feature-wrap">
            <p>
              Range {{ getProjDescription.Duration }} seconds, Delay
              {{ getProjDescription.Delay }} ms
            </p>
          </div>
        </div>
        <div class="center bottom-action">
          <Recorder
            v-if="getActiveDevice !== 'robot'"
            :isRecording="isRecording"
            :isShouldStart="activeVoice && getActiveDevice !== 'robot'"
            :visualize="visualize"
            :upload="uploadClientWAV"
          />
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
import Recorder from "@/components/recorder.vue";

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
    Recorder,
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
      forceItemRender: true,
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
        this.getActiveDevice === "robot"
          ? this.recordByRobot()
          : this.recordByClient();
        this.timeInterval = setInterval(() => {
          this.getActiveDevice === "robot"
            ? this.recordByRobot()
            : this.recordByClient();
        }, parseInt(this.getProjDescription.Duration) * 1000 + parseInt(this.getProjDescription.Delay));
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
        duration: parseInt(this.getProjDescription.Duration),
      });

      setTimeout(() => {
        this.activeVoice = true;
        setTimeout(() => {
          this.activeVoice = false;
        }, parseInt(parseInt(this.getProjDescription.Duration) * 1000));
      }, parseInt(1500));

      // deactive speaking

      // this.activeVoice = true;
      console.log("call robot record");
    },
    recordByClient() {
      this.activeVoice = true;
      setTimeout(() => {
        this.activeVoice = false;
      }, parseInt(parseInt(this.getProjDescription.Duration) * 1000));
    },
    changeOrder(idx, direction) {
      var lastOrder = this.getAudios.map((e) => e.fileName);
      var temp = lastOrder[idx];
      lastOrder[idx] = lastOrder[idx + direction];
      lastOrder[idx + direction] = temp;

      axiosInstance
        .put(`/wav/${this.getProjectDir}/order`, { order: lastOrder })
        .then((response) => {
          this.$store.dispatch("reqAudios");
        });
    },
    stopRecord() {
      clearInterval(this.timeInterval);
      console.log("Stop recording");

      // check delay 
      // show loading
      setTimeout(() => {
        axiosInstance
          .post(`/wav/${this.getProjectDir}/order/add`)
          .then((response) => {
            // Delay
            setTimeout(() => {
              this.$store.dispatch("reqAudios");
            },1000)
          });
      },2000)
      
    },
    onRecord() {
      if (this.isRecording) {
        // start recording here
        this.isRecording = false;
        this.stopRecord();
        this.countDown = 3;
        this.timeSpent = 0;
      } else {
        this.isRecording = true;
        this.countDownTimer();
      }
    },
    deleteSound: function (event, index) {
      event.stopPropagation();
      // console.log('Deleting : ',item.id,item.fileName);
      axiosInstance
        .delete(`/wav/${this.getProjectDir}/${this.getAudios[index].fileName}`)
        .then(() => {
          setTimeout(() => {
            this.$store.dispatch("reqAudios");
            console.log("Sound has been deleted");
          },800)
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
    forceItemRerender() {
      this.forceItemRender = false;
      this.$nextTick(() => {
        this.forceItemRender = true;
      });
    },
    onSetCurrent: function (time) {
      this.timeCurrent = time;
    },
    onSetDuration: function (time) {
      this.timeDuration = time;
    },
    visualize: function (audioCtx, stream, mediaStreamSource) {
      const canvas = document.getElementById("waveform-client");
      const ctx = canvas.getContext("2d");
      var analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);

      mediaStreamSource.connect(analyser);

      draw();

      function draw() {
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvas.style.width = "100%";
        canvas.style.height = "100%";

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(255, 255, 255)";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();

        var sliceWidth = (canvas.width * 1.0) / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
          var v = dataArray[i] / 128.0;
          var y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.closePath();
      }
    },
    uploadClientWAV: function (blob) {
      var reader = new FileReader();
      var vm = this;
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        var base64 = reader.result;
        axiosInstance.post(`/wav/${vm.getProjectDir}/client/upload`, { base64 }).then(response => {
          console.log('upload completed.')
        })
      };
    },
  },
  mounted() {},
  computed: {
    ...mapGetters([
      "getProjectDir",
      "getAudios",
      "getRealtimeSound",
      "getProjDescription",
      "getActiveDevice",
    ]),
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
    getAudios: function (value) {
      this.forceItemRerender();
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
    padding: 2em;
    width: 100%;
    background: #e6e6e6;
    border-radius: 20px;
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
.items-wrapper {
  height: calc(100% - 250px);
  overflow-y: auto;
}
.no-record {
  height: 100%;
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
.tag-annotate {
  border-radius: 50%;
  background: white;
  width: 30px;
  height: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 0.3em;
}
</style>
