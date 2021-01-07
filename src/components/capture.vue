<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div
        class="d-flex flex-fill flex-column main-panel"
        style="background-color: white"
      >
        <div
          class="d-flex flex-fill align-items-center justify-content-center view-panel"
        >
          <!-- <div class="row">
            <b-col md="auto">
              <div class="image-container">
                <b-img
                  v-show="getImgSrc !== null"
                  crossorigin="anonymous"
                  style="margin-top: 10px; width: 100%"
                  :src="getImgSrc"
                  alt="Center image"
                ></b-img>
                <p class="view-img-desc" v-show="getImgSrc === null">No selected image, please click on the image below to select.</p>
              </div>
            </b-col>
          </div> -->
          <b-img
            v-show="getImgSrc !== null"
            crossorigin="anonymous"
            style="margin-top: 10px; width: 100%"
            :src="getImgSrc"
            alt="Center image"
          ></b-img>
          <p class="view-img-desc" v-show="getImgSrc === null">
            No selected image, please click on the image below to select.
          </p>
          <!-- <b-img
            v-show="getImgSrc !== null"
            crossorigin="anonymous"
            style="margin-top: 10px; width: 100%"
            :src="getImgSrc"
          ></b-img>
          <p class="view-img-desc" v-show="getImgSrc === null">No selected image, please click on the image below to select.</p> -->
          <div class="img-counter">
            <span class="current-img">
              {{imageActiveIndex !== -1 ? imageActiveIndex + 1 : null}}
            </span>
            <span class="ov-img">
              {{ imageActiveIndex !== -1 ? "/" : null }}
              {{ getImages.length }} IMAGES
            </span>
          </div>
        </div>
        <div class="img-slider">
          <div
            :id="id"
            :class="{
              img: true,
              active: imageActiveIndex === id,
            }"
            v-for="(file, id) in getImages"
            :key="id"
            v-on:click="onSelect($event)"
          >
            <img class="thumb" :src="file.file" alt="" srcset="" />
            <img
              class="cancel-btn"
              src="../assets/UI/png/cancel.png"
              @click="deleteImage($event, id)"
              alt=""
              srcset=""
            />
          </div>
          <!-- <div class="img">
            <img class="thumb" src="../assets/UI/png/Rectangle 21.png" alt="">
            <img class="cancel-btn" src="../assets/UI/png/cancel.png" alt="">
          </div> -->
        </div>
      </div>
      <div class="side-panel" style="width: 300px">
        <div class="display-panel liveview">
          <vue-web-cam
            v-show="getActiveDevice === 'computer'"
            ref="webcam"
            :device-id="deviceId"
            width="260"
            height="auto"
            @started="onStarted"
            @stopped="onStopped"
            @error="onError"
            @cameras="onCameras"
            @camera-change="onCameraChange"
          />
          <b-img
            v-show="getActiveDevice === 'robot'"
            ref="displayImage"
            crossorigin="anonymous"
            width="260"
            src=""
          >
          </b-img>
        </div>
        <div class="center">
          <img
            @click="onCapture"
            v-on:click.prevent
            class="camera-btn op-btn"
            src="../assets/UI/png/Group 198.png"
            height="96"
            alt=""
            srcset=""
          />
          <img
            v-b-modal.modal-import
            class="camera-btn op-btn"
            src="../assets/UI/png/Group 199.png"
            height="96"
            alt=""
            srcset=""
          />
        </div>
      </div>
    </div>
    <b-modal
      id="modal-import"
      centered
      title="IMPORT PHOTOS"
      modal-class="my-modal-class"
      :hide-footer="true"
    >
      <div v-show="importShow">
        <p class="modal-ttl">Please use ' browse ' for importing images</p>
        <div class="text-center">
          <img src="../assets/UI/png/khanomchan-import.png" width="120px" />
        </div>
        <div class="text-center">
          <label for="import" @click="onClickHandler">
            <b-btn block class="btn-green">Browse</b-btn>
          </label>
          <input
            type="file"
            accept="image/*"
            id="import"
            ref="import"
            multiple
            class="import-input"
            v-on:change="handleFileUpload()"
          />
        </div>
      </div>
      <div v-show="!importShow">
        <div class="text-center">
          <vm-progress
            type="circle"
            :percentage="importProgressPercent"
            style="vertical-align: middle"
            strokeColor="#007E4E"
            stroke-width="24"
            :width="200"
            ><h4>
              {{
                importProgressPercent === 100
                  ? "COMPLETE"
                  : `${importProgressPercent}%`
              }}
            </h4>
            <p class="progress-text">{{ importProgressFile }}</p></vm-progress
          >
        </div>
        <div class="text-center">
          <b-btn
            class="btn-grey"
            :disabled="importProgressPercent === 100"
            @click="confirmImport"
            >cancel</b-btn
          >
          <b-btn
            class="btn-green"
            :disabled="importProgressPercent !== 100"
            @click="confirmImport"
            >confirm</b-btn
          >
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import "vue-awesome/icons";

import { mapGetters } from "vuex";
import { WebCam } from "vue-web-cam";

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
  name: "Capture",
  components: {
    "vue-web-cam": WebCam,
  },
  props: {},
  created() {},
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
      imageActiveIndex: -1,
      showCapturing: false,
      camera: null,
      deviceId: null,
      devices: [],
      isCameraOpen: false,
      import: [],
      importDone: 0,
      uploadPercentage: 0,
    };
  },
  methods: {
    confirmImport() {
      this.$bvModal.hide("modal-import");
    },
    onClickHandler(e) {
      if (e.target !== e.currentTarget) {
        this.import = [];
        this.importDone = 0;
        e.currentTarget.click();
      }
    },
    handleFileUpload() {
      const files = Array.from(this.$refs.import.files);
      this.import = files;
      if (files.length > 0) {
        files.forEach((im) => {
          this.submitFile(im);
        });
      }
    },
    submitFile(img) {
      let formData = new FormData();
      formData.append("image", img);
      let self = this;
      axiosInstance
        .post(`/import/images/${this.$store.state.projectDir}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(function () {
          console.log("SUCCESS!!");
          self.importDone += 1;
        })
        .catch(function () {
          console.log("FAILURE!!");
        });
    },
    onCapture() {
      if (this.getActiveDevice === "robot") {
        this.captureFromRobot().then((img) => {
          this.saveImage(img);
        });
      } else {
        let img = this.$refs.webcam.capture();
        this.saveImage(img);
      }
    },
    onStarted(stream) {
      if (this.getActiveDevice !== "computer") this.$refs.webcam.stop();
    },
    onStopped(stream) {},
    onStop() {
      this.$refs.webcam.stop();
    },
    onStart() {
      this.$refs.webcam.start();
    },
    onError(error) {
      console.log("On Error Event", error);
    },
    onCameras(cameras) {
      this.devices = cameras;
      console.log("On Cameras Event", cameras);
    },
    onCameraChange(deviceId) {
      this.deviceId = deviceId;
      this.camera = deviceId;
      console.log("On Camera Change Event", deviceId);
    },
    saveImage: async function (base64image) {
      await axiosInstance
        .post("/upload/image", {
          path: this.$store.state.projectDir,
          base64image,
        })
        .then((response) => {
          if (response.data.status === "OK") {
            console.log("File is OK!!!!");
            this.$store.dispatch("reqImages");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    captureFromRobot: async function () {
      var c = document.createElement("canvas");
      c.width = 1280;
      c.height = 720;
      var ctx = c.getContext("2d");
      var img = this.$refs.displayImage;
      ctx.drawImage(img, 0, 0, 1280, 720);
      const imgData64 = c.toDataURL("image/jpeg");

      return imgData64;
    },
    deleteImage: function (event, index) {
      event.stopPropagation();
      console.log("Image has been deleted");

      axiosInstance
        .post("deleteImage", {
          projectpath: this.getProjectDir,
          filename: this.getImages[index].fileName,
        })
        .then((response) => {
          console.log(response.data);
          this.$store.dispatch("reqImages");
        });
    },
    onSelect: function (event) {
      var targetId = event.currentTarget.id;
      var index = Number(targetId);
      this.imageActiveIndex = index;
      this.imFolder = "images";
    },
    onForward: function () {
      // var x = 0;
      var y = 0;
      var z = 0;
      var pub = true;
      if (pub === true) {
        // eslint-disable-next-line no-undef
        var twist = new ROSLIB.Message({
          angular: {
            x: 0,
            y: 0,
            z: z,
          },
          linear: {
            x: 0.1,
            y: y,
            z: z,
          },
        });
        console.log(twist);

        this.cmdVel.publish(twist);
        console.log(this.cmdVel);
      }
    },
    onBackward: function () {
      // var x = 0;
      var y = 0;
      var z = 0;
      var pub = true;
      if (pub === true) {
        // eslint-disable-next-line no-undef
        var twist = new ROSLIB.Message({
          angular: {
            x: 0,
            y: 0,
            z: z,
          },
          linear: {
            x: -0.1,
            y: y,
            z: z,
          },
        });
        console.log(twist);

        this.cmdVel.publish(twist);
        console.log(this.cmdVel);
      }
    },
    onLeft: function () {
      // var x = 0;
      var y = 0;
      var z = 0;
      var pub = true;
      if (pub === true) {
        // eslint-disable-next-line no-undef
        var twist = new ROSLIB.Message({
          angular: {
            x: 0,
            y: 0,
            z: -0.3,
          },
          linear: {
            x: 0.1,
            y: y,
            z: z,
          },
        });
        console.log(twist);

        this.cmdVel.publish(twist);
        console.log(this.cmdVel);
      }
    },
    onRight: function () {
      // var x = 0;
      var y = 0;
      var z = 0;
      var pub = true;
      if (pub === true) {
        // eslint-disable-next-line no-undef
        var twist = new ROSLIB.Message({
          angular: {
            x: 0,
            y: 0,
            z: 0.3,
          },
          linear: {
            x: 0.1,
            y: y,
            z: z,
          },
        });
        console.log(twist);

        this.cmdVel.publish(twist);
        console.log(this.cmdVel);
      }
    },
    onCCW: function () {
      // var x = 0;
      var y = 0;
      var z = 0;
      var pub = true;
      if (pub === true) {
        // eslint-disable-next-line no-undef
        var twist = new ROSLIB.Message({
          angular: {
            x: 0,
            y: 0,
            z: 0.3,
          },
          linear: {
            x: 0,
            y: y,
            z: z,
          },
        });
        console.log(twist);

        this.cmdVel.publish(twist);
        console.log(this.cmdVel);
      }
    },
    onCW: function () {
      // var x = 0;
      var y = 0;
      var z = 0;
      var pub = true;
      if (pub === true) {
        // eslint-disable-next-line no-undef
        var twist = new ROSLIB.Message({
          angular: {
            x: 0,
            y: 0,
            z: -0.3,
          },
          linear: {
            x: 0,
            y: y,
            z: z,
          },
        });
        console.log(twist);

        this.cmdVel.publish(twist);
        console.log(this.cmdVel);
      }
    },
  },

  directives: {},

  mounted() {
    axiosInstance.get("getIP", axios_options).then((response) => {
      this.$refs.displayImage.src =
        "http://" +
        response.data.IP +
        ":8080/stream?topic=/output/image_raw&type=ros_compressed";
    });

    console.log("Started roslibjs");
  },
  computed: {
    ...mapGetters(["getProjectDir", "getImages", "getActiveDevice"]),
    getImgSrc: function () {
      return this.imgSrc;
    },
    device: function () {
      return this.devices.find((n) => n.deviceId === this.deviceId);
    },
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
    getActiveDevice: function (value) {
      if (value === "robot") this.onStop();
      else this.onStart();
    },
    imageActiveIndex: function (index) {
      if(index != -1){
        this.imgSrc = this.getImages[index].file;
        this.selectedFile = this.getImages[index].fileName;
      }
    },
    getImages: function () {
      if (this.imageActiveIndex === 0 && this.getImages[0] != undefined) {
        this.imgSrc = this.getImages[0].file;
        this.selectedFile = this.getImages[0].fileName;
      }else{
        this.imgSrc = null;
        this.imageActiveIndex = -1;
        // this.imageActiveIndex = 0;
        console.log('Import : ',{
          'this.import':this.import,
          'this.importDone':this.importDone
        })
      }
    },
    importDone: function (value) {
      if (this.import.length > 0 && value === this.import.length) {
        this.$store.dispatch("reqImages");
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
  margin: 0 0.5em;

  &:hover {
    opacity: 0.7;
  }
}

.side-panel {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 300px;

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

.view-panel {
  background-color: #333;
  position: relative;
  img {
    min-width: 50%;
    min-height: 50%;
    object-fit: contain;
  }
  .view-img-desc {
    color: #fff;
  }
  .img-counter {
    position: absolute;
    bottom: 30px;
    right: 30px;
    background-color: #fff;
    border-radius: 19px;
    padding: 10px 20px;
    box-shadow: 0 0 10px #33333333;
    span {
      font-weight: bold;
    }
    .current-img {
      color: $primary-color;
      padding-right: 5px;
    }
  }
}

.img-slider {
  display: -webkit-box;
  width: calc(100% - 40px);
  overflow-x: scroll;
  height: 140px;
  position: relative;
  padding-top: 6px;
  margin: 20px;

  .img {
    background-color: #2f3241;
    height: 120px;
    width: 120px;
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
.liveview {
  margin: 2em 1em;
}

.import-description {
  text-align: center;
  letter-spacing: 0px;
  color: #0090ff;
  text-transform: capitalize;
}

.import-input {
  width: 0;
  height: 0;
  overflow: hidden;
}

.text-center {
  text-align: center;
  margin-top: 2em;
}

.btn-green {
  background: #007e4e !important;
  border-radius: 30px;
  text-transform: uppercase;
  border: none;
  &:hover {
    background: #006941 !important;
  }
}

.btn-grey {
  background: #eeeeee;
  color: #333333;
  border-radius: 30px;
  text-transform: uppercase;
  border: none;
  margin-right: 1em;
}

.progress-text {
  color: #666666;
  font-size: 14px;
}
</style>
