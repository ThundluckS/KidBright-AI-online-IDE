<template>
  <div>
    <div class="container-fluid vh-100 d-flex main-bg">
      <div class="left-panel d-flex flex-column">
        <div class="l-title font-weight-bold">KidBright AI</div>
        <div class="d-inline-flex flex-wrap menu-starter">
          <div
            class="btn-base new"
            data-md-tooltip="สร้าง Project ใหม่"
            v-b-modal.modal-prevent-closing
          />
          <div
            data-md-tooltip="เปิด Project ที่เคยสร้างไว้แล้ว"
            class="btn-base open"
            v-on:click="getAllProjects"
            v-b-modal.modal_list_files
          />
          <div
            data-md-tooltip="บันทึกข้อมูล"
            class="btn-base save"
            @click="saveToUSB"
            :disabled="isLoading || isSaving"
          >
            <b-spinner v-if="isSaving" small />
          </div>
          <div
            data-md-tooltip="ลบ Project"
            class="btn-base delete"
            variant="danger"
            :disabled="isLoading || isSaving"
            v-b-modal.modal_list_delete_files
          />
        </div>
        <div class="left-bottom-content d-flex flex-fill position-relative">
          <div class="header-left-bar">
            <div class="proj-name">
              {{ getProjectDir }}
            </div>
            <div class="proj-type">Type : {{ getTrainingType }}</div>
            <div class="header-action-button">
              <b-btn
                :class="['text-green', !currentWifi ? 'inactive' : '']"
                @click="wifiConnect"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28.714"
                  height="24.742"
                  viewBox="0 0 28.714 24.742"
                  v-if="!currentWifi"
                >
                  <path
                    d="M29.254,9.018A23.82,23.82,0,0,0,14.9,4.084a22.775,22.775,0,0,0-5.119.592L22.52,17.405ZM21.114,19.157,4.129,2.16,2.563,3.739,5.091,6.28A22.331,22.331,0,0,0,.54,9.018L14.885,26.89l.012.012.012-.012L19.72,20.9l4.095,4.095,1.566-1.566-4.268-4.268Z"
                    transform="translate(-0.54 -2.16)"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27.898"
                  height="22.177"
                  viewBox="0 0 27.898 22.177"
                  v-else
                >
                  <path
                    d="M14.59,25.165,28.528,7.79A23.155,23.155,0,0,0,14.579,3,23.155,23.155,0,0,0,.63,7.79L14.568,25.154l.011.022.011-.011Z"
                    transform="translate(-0.63 -3)"
                  />
                </svg>
                {{ currentWifi ? currentWifi : "No Internet" }}</b-btn
              >
              <b-btn
                v-show="getTrainingType !== 'Sound'"
                v-bind:class="'connection-' + getActiveDevice"
                @click="onToggleDevice"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="46.432"
                  height="42.861"
                  viewBox="0 0 46.432 42.861"
                >
                  <path
                    d="M26.591,22.885a4.6,4.6,0,1,0,4.643,4.6A4.633,4.633,0,0,0,26.591,22.885Zm13.93,4.6A13.93,13.93,0,1,0,19.626,39.432l2.322-4.022A9.065,9.065,0,0,1,17.3,27.482a9.287,9.287,0,0,1,18.573,0,9.065,9.065,0,0,1-4.644,7.929l2.322,4.022A13.834,13.834,0,0,0,40.521,27.482ZM26.591,4.5A23.167,23.167,0,0,0,3.375,27.482,22.9,22.9,0,0,0,14.983,47.361L17.3,43.339A18.271,18.271,0,0,1,8.017,27.482a18.575,18.575,0,0,1,37.147,0,18.132,18.132,0,0,1-9.287,15.857L38.2,47.361A22.9,22.9,0,0,0,49.807,27.482,23.167,23.167,0,0,0,26.591,4.5Z"
                    transform="translate(-3.375 -4.5)"
                  />
                </svg>
                {{ getActiveDevice }} Device</b-btn
              >
            </div>
          </div>
          <ul class="step">
            <li
              :class="{
                current: selectedMenu === 1,
                inactive: getProjectDir === 'None',
              }"
              @click="getProjectDir !== 'None' && handleTabChange(1)"
            >
              <img src="../assets/UI/png/capture.png" alt="" srcset="" />
            </li>
            <li
              v-bind:class="{
                current: selectedMenu === 2,
                inactive: !shouldAnnotateEnable,
              }"
              v-on:click="
                if (shouldAnnotateEnable) {
                  handleTabChange(2);
                }
              "
            >
              <img src="../assets/UI/png/annotate.png" alt="" srcset="" />
            </li>
            <li
              :class="{
                current: selectedMenu == 3,
                inactive: !shouldTrainEnable,
              }"
              @click="
                if (shouldTrainEnable) {
                  handleTabChange(3);
                }
              "
            >
              <img src="../assets/UI/png/train.png" alt="" srcset="" />
            </li>
            <li
              :class="{
                current: selectedMenu == 4,
              }"
              @click="handleTabChange(4)"
            >
              <img src="../assets/UI/png/code.png" alt="" srcset="" />
            </li>
          </ul>
          <div v-if="getTrainingType === 'None'" class="hint">
            <div
              class="main-hint txt"
              :class="{ notype: getTrainingType === 'None' }"
            >
              <p>
                เริ่มใช้งานโดยกด
                <img src="../assets/UI/png/Group 105.png" alt="" srcset="" />
                เพื่อสร้างโปรเจคและทำการเลือกประเภทการเรียนรู้
                <span class="p-color">Object Detection</span> หรือ
                <span class="p-color">Image Classification</span
                ><br /><br />ในกรณีที่เลือก
                <span class="p-color">Object Detection</span>
                กระบวนการสร้างโมเดล (Training) ทำบน Colab
                จำเป็นต้องเชื่อมต่ออินเทอร์เน็ตให้เรียบร้อยก่อน<br /><br />ในกรณีที่เลือก
                <span class="p-color">Image Classification</span>
                กระบวนการสร้างโมเดล (Training) ทำบน KidBright AI
              </p>
            </div>
            <div class="mascot">
              <img
                v-if="!isRunning"
                src="../assets/UI/png/Mask Group 11.png"
                alt=""
                srcset=""
              />
            </div>
          </div>
          <div
            v-if="getTrainingType !== 'None' && selectedMenu === 1"
            class="hint"
          >
            <div class="main-hint txt">
              <p class="p-color font-weight-bold">ขั้นตอนที่ 1 Capture</p>
              <p>
                ขั้นตอนนี้เป็นการใช้งานกล้องในการเก็บภาพที่ต้องการ โดยกดปุ่ม
                <img src="../assets/UI/svg/Group 113.svg" alt="" srcset="" />
                เพื่อถ่ายภาพ (ควรถ่ายภาพวัตถุในมุมต่างๆ ประมาณ 50 ภาพต่อวัตถุ
                หรือมากกว่า)
              </p>
            </div>
            <div class="mascot">
              <img src="../assets/UI/png/Mask Group 11.png" alt="" srcset="" />
            </div>
          </div>
          <div
            v-if="getTrainingType !== 'None' && selectedMenu === 2"
            class="hint"
          >
            <div class="main-hint txt">
              <p class="p-color font-weight-bold">ขั้นตอนที่ 2 Annotate</p>
              <p>ขั้นตอนนี้ใช้สำหรับกำหนดขอบเขตและระบุชื่อวัตถุ</p>
              <p>
                <br />1. กดปุ่ม
                <img src="../assets/UI/svg/Group 97.svg" alt="" srcset="" />
                เพื่อตั้งชื่อใหม่ให้กับวัตถุจากนั้นกำหนดขอบเขตโดยให้วัตถุอยู่ภายในกรอบสี่เหลี่ยมที่กำหนด
              </p>
              <p>
                <br />2. กดปุ่ม
                <img src="../assets/UI/svg/interface.svg" alt="" srcset="" />
                เมื่อต้องการใช้ชื่อที่ตั้งไว้เเล้ว
                จะประกฏกรอบสี่เหลี่ยมขึ้นบนภาพ
                <img src="../assets/UI/svg/Group 96.svg" alt="" srcset="" />
                จากนั้นกำหนดขอบเขตให้วัตถุ
              </p>
            </div>
            <div class="mascot">
              <img src="../assets/UI/png/Mask Group 11.png" alt="" srcset="" />
            </div>
          </div>
          <div
            v-if="
              getTrainingType === 'Image classification' && selectedMenu === 3
            "
            class="hint"
          >
            <div class="main-hint txt">
              <p class="p-color font-weight-bold">
                ขั้นตอนที่ 3 Training<br />(Image Classification)
              </p>
              <p>ขั้นตอนนี้เป็นการนำภาพที่ Annotate มาแล้วมาสร้างโมเดลรู้จำ</p>
              <p>
                <br />1. กดปุ่ม
                <span class="p-color">Train</span> เพื่อสร้างโมเดล
                รอจนกระบวนการสร้างโมเดลแล้วเสร็จ
              </p>
              <p>
                <br />2. กดปุ่ม
                <span class="p-color">Download</span>
                เมื่อเสร็จขั้นตอนนี้โมเดลจะถูกเรียกใช้ได้ในขั้นตอนที่ 4 Coding
              </p>
            </div>
            <div class="mascot">
              <img src="../assets/UI/png/Mask Group 11.png" alt="" srcset="" />
            </div>
          </div>
          <div
            v-if="getTrainingType === 'Object detection' && selectedMenu === 3"
            class="hint"
          >
            <div class="main-hint txt">
              <p class="p-color font-weight-bold">
                ขั้นตอนที่ 3 Training<br />(Object Detection)
              </p>
              <p>
                ขั้นตอนนี้เป็นการนำภาพที่ Annotate แล้วมาสร้างโมเดลรู้จำ โดยใช้
                Google Colab ในการสร้างโมเดล
                จึงจำเป็นต้องเชื่อมต่ออินเทอร์เน็ตให้เรียบร้อยก่อน
              </p>
              <p>
                <br />1. กดปุ่ม
                <span class="p-color">Create</span> เพื่อเรียกหน้า Colab
                จากนั้นทำการ login โดยใช้ Google Account ทำตามกระบวนการที่ปรากฏ
                เมื่อเสร็จสิ้นทำการคัดลอก URL
              </p>
              <p>
                <br />2. เลือกหน้าเว็บ KidBright AI และนำ URL
                ที่คัดลอกมาใส่ในกล่องข้อความสีเทา
              </p>
              <p>
                <br />3. กดปุ่ม
                <span class="p-color">Train</span> เพื่อส่งภาพไปสร้างโมเดลที่
                Colab รอจนกระบวนการสร้างโมเดลเสร็จสิ้น
              </p>
              <p>
                <br />4. กดปุ่ม
                <span class="p-color">Download</span> เพื่อนำโมเดลจาก Colab
                มาเก็บที่ KidBright AI
                เมื่อเสร็จขั้นตอนนี้โมเดลจะถูกเรียกใช้ได้ในขั้นตอนที่ 4 Coding
              </p>
            </div>
            <div class="mascot">
              <img src="../assets/UI/png/Mask Group 11.png" alt="" srcset="" />
            </div>
          </div>
          <div
            v-if="getTrainingType !== 'None' && selectedMenu === 4"
            class="hint"
          >
            <div class="main-hint txt">
              <p class="p-color font-weight-bold">ขั้นตอนที่ 4 Coding</p>
              <p>
                ขั้นตอนนี้ใช้สร้างชุดคำสั่งโดยการลากบล็อคคำสั่งจากแถบเครื่องมือ
                ในกรณีที่ยังไม่มีโมเดลรู้จำต้องการทำกระบวนการสร้างโมเดล
                โดยมีลำดับเริ่มจาก<br /><span class="p-color"
                  >ขั้นตอนที่ 1 (Capture)</span
                >
                <br /><span class="p-color">ขั้นตอนที่ 2 (Annotate)</span>
                <br /><span class="p-color">ขั้นตอนที่ 3 (Training)</span>
              </p>
            </div>
            <div class="mascot">
              <img
                v-if="!isRunning"
                src="../assets/UI/png/Mask Group 11.png"
                alt=""
                srcset=""
              />
              <img
                v-if="isRunning"
                src="../assets/UI/svg/Mask Group 10.svg"
                alt=""
                srcset=""
              />
            </div>
          </div>
        </div>
      </div>
      <div class="content-panel d-flex flex-fill">
        <Capture
          ref="captureComponent"
          v-if="getTrainingType !== 'Sound' && selectedMenu === 1"
        />
        <Record
          ref="recordComponent"
          v-if="getTrainingType === 'Sound' && selectedMenu === 1"
        />
        <Anotate
          ref="anotateComponent"
          v-if="getTrainingType === 'Object detection' && selectedMenu === 2"
        />
        <AnnotateForClassify
          ref="anotateForClassifyComponent"
          v-if="
            getTrainingType === 'Image classification' && selectedMenu === 2
          "
        />
        <AnnotateAudio
          ref="anotateAudio"
          v-if="getTrainingType === 'Sound' && selectedMenu === 2"
        />
        <Train
          ref="trainComponent"
          v-if="getTrainingType === 'Object detection' && selectedMenu === 3"
        />
        <TrainLocal
          ref="trainLocalComponent"
          v-if="getTrainingType === 'Image classification' && selectedMenu === 3"
        />
        <TrainAudio
          ref="trainLocalAudioComponent"
          v-if="getTrainingType === 'Sound' && selectedMenu === 3"
        />
        <BlocklyComponent
          ref="blocklyComponent"
          v-bind:is-running="isRunning"
          v-bind:is-project-loaded="isProjectLoaded"
          v-if="selectedMenu === 4"
          v-on:run="showCode()"
          v-on:stop-run="stopRun()"
        />
      </div>
    </div>
    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      title="สร้างโปรเจคใหม่"
      modal-class="my-modal-class"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-dropdown
          id="dropdown-1"
          :text="
            typeSelect !== 'None'
              ? typeSelect
              : 'เลือกประเภทการเรียนรู้ (Select training type)'
          "
          class="mode-select"
        >
          <b-dropdown-item @click="handleSelect('Object detection')"
            >การตรวจจับวัตถุ (Object detection)</b-dropdown-item
          >
          <b-dropdown-item @click="handleSelect('Image classification')"
            >การแยกแยะรูปภาพ (Image classification)</b-dropdown-item
          >
          <b-dropdown-item @click="handleSelect('Sound')"
            >Time series: Sound</b-dropdown-item
          >
          <b-dropdown-item @click="handleSelect('IMU sensor')"
            >Time series: IMU Sensor</b-dropdown-item
          >
        </b-dropdown>
        <b-form-group
          :state="nameState"
          label="Name"
          label-for="name-input"
          invalid-feedback="Name is required"
        >
          <b-form-input
            id="name-input"
            v-model="projectDirIn"
            :state="nameState"
            required
          ></b-form-input>
        </b-form-group>
        <p class="p-notice-color small">* เงื่อนไขการตั้งชื่อโปรเจค</p>
        <p class="p-notice-color small">1. ภาษาอังกฤษเท่านั้น</p>
        <p class="p-notice-color small">
          2. ห้ามเว้นวรรค หากต้องการเว้นวรรคให้ใช้สัญลักษณ์ขีดล่าง _ แทน
        </p>
      </form>
    </b-modal>

    <b-modal
      id="modal_list_files"
      ref="openModal"
      title="เปิดโปรเจค"
      modal-class="my-modal-class"
      @show="resetOpenModal"
      @hidden="resetOpenModal"
      @ok="openProject"
    >
      <b-dropdown
        id="dropdown-1"
        :text="
          typeSelect !== 'None'
            ? typeSelect
            : 'เลือกประเภทการเรียนรู้ (Select training type)'
        "
        class="mode-select"
      >
        <b-dropdown-item @click="handleSelect('None')">None</b-dropdown-item>
        <b-dropdown-item @click="handleSelect('Object detection')"
          >การตรวจจับวัตถุ (Object detection)</b-dropdown-item
        >
        <b-dropdown-item @click="handleSelect('Image classification')"
          >การแยกแยะรูปภาพ (Image classification)</b-dropdown-item
        >
        <b-dropdown-item @click="handleSelect('Sound')"
          >Time series: Sound</b-dropdown-item
        >
        <b-dropdown-item @click="handleSelect('IMU sensor')"
          >Time series: IMU Sensor</b-dropdown-item
        >
      </b-dropdown>
      <p class="p-notice-color small">* กรุณาเลือกประเภทการเรียนรู้</p>
      <b-table
        show-empty
        striped
        hover
        stacked="md"
        caption-top
        selectable
        :select-mode="selectMode"
        selectedVariant="success"
        :items="projectsName"
        @row-selected="rowSelected"
        @row-clicked="rowClicked"
      >
      </b-table>
    </b-modal>

    <b-modal
      id="modal_list_delete_files"
      title="Project list"
      @ok="handleProjectDelete"
      modal-class="my-modal-class"
    >
      <b-table
        show-empty
        striped
        hover
        stacked="md"
        caption-top
        selectable
        :select-mode="selectMode"
        selectedVariant="success"
        :items="projectsName"
        @row-selected="rowDeleteSelected"
        @row-clicked="rowDeleteClicked"
      >
      </b-table>
    </b-modal>

    <b-modal
      ref="pyhonLoading"
      hide-footer
      title="Loading code"
      modal-class="my-modal-class"
    >
      <div class="d-block text-center">
        <b-progress
          :max="max"
          height="2rem"
          :striped="true"
          show-progress
          :animated="true"
        >
          <b-progress-bar :value="value" variant="success">
            <h5 v-if="value > 0">Loading</h5>
          </b-progress-bar>
        </b-progress>
      </div>
    </b-modal>

    <b-modal
      modal-class="my-modal-class"
      id="wifi_conn"
      title="WIFI SETTING"
      @ok="connectToWifi"
    >
      <p class="modal-ttl">Please select wifi from list</p>
      <p class="modal-desc">
        เลือกเครือข่าย wi-fi เพื่อเชื่อต่ออินเทอร์เน็ต สำหรับ KidBright AI<br />หมายเหตุ
        : แนะนำให้เลือกเครือข่ายเดียวกันกับคอมพิวเตอร์
      </p>
      <b-dropdown
        id="ddCommodity"
        name="ddCommodity"
        :text="selected_ssid ? selected_ssid : 'Select Wi-Fi'"
        v-model="selected_ssid"
        variant="secondary"
        class="mb-2"
        menu-class="w-100"
        block
      >
        <b-dropdown-item
          v-for="option in ap_names"
          :key="option.value"
          :value="option.value"
          @click="selected_ssid = option.value"
        >
          {{ option.text }}
        </b-dropdown-item>
      </b-dropdown>

      <b-form-input
        v-model="wifi_password"
        placeholder="กรุณาใส่รหัสผ่าน"
      ></b-form-input>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";
import Anotate from "@/components/anonate.vue";
import AnnotateForClassify from "@/components/annotateForClassify.vue";
import AnnotateAudio from "@/components/annotateAudio.vue";
import Capture from "@/components/capture.vue";
import Record from "@/components/record.vue";
import BlocklyComponent from "@/components/BlocklyComponent.vue";
import Train from "@/components/train.vue";
import TrainLocal from "@/components/trainLocal.vue";
import TrainAudio from "@/components/trainAudio.vue";
import "../blocks/stocks";
import "../prompt";
// import { VueTabs, VTab } from "vue-nav-tabs";
//you can also import this in your style tag
import "vue-nav-tabs/themes/vue-tabs.css";
import "vue-awesome/icons";
// import VIcon from 'vue-awesome/components/Icon'

//import BlocklyJS from 'blockly/javascript';
import blocklyPython from "blockly/python";
import Blockly from "blockly";
//import Blockly from 'node-blockly/browser';
//import blocklyPython from 'node-blockly/python';

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`,
});

var axios_options = {
  proxy: {
    host: "127.0.0.1",
    port: 3000,
  },
};

export default {
  name: "Main",
  components: {
    Anotate,
    AnnotateForClassify,
    AnnotateAudio,
    Capture,
    Record,
    Train,
    TrainLocal,
    TrainAudio,
    // eslint-disable-next-line vue/no-unused-components
    BlocklyComponent,
    // VIcon,
  },
  data: function () {
    return {
      hasImage: true,
      finishAnnotation: true,
      selectMode: "single",
      selectedMenu: 4,
      activetab: 1,
      nameState: null,
      projectDirIn: "",
      projectsName: [],
      projectsfromUSB: [],
      directorySelected: null,
      deletingProject: null,
      loaded: false,
      blockly_woakspace: null,
      code: "",
      code_file: "",
      options: {},
      isRunHiden: true,
      isStopHidden: false,
      isProjectLoaded: true,
      isRunning: false,
      //url: "http://192.168.88.243:8080/stream?topic=/output/image_detected&type=ros_compressed"
      url: "",
      ipAddress: "192.168.88.247",
      value: 0,
      max: 24,
      cmdVel: null,
      isSaving: false,
      isLoading: false,
      rbServer: null,
      ap_names: [],
      selected_ssid: null,
      wifi_password: "",
      currentWifi: null,
      typeSelect: "None",
    };
  },
  methods: {
    onToggleDevice() {
      this.$store.dispatch("toggleActiveDevice");
    },
    rowSelected(items) {
      //console.log(items)
      return (this.selected = items);
    },
    rowClicked: function (item, index) {
      this.projectDirIn = this.projectsName[index].Projects;
    },
    rowDeleteSelected(items) {
      //console.log(items)
      this.selected = items;
      this.isProjectLoaded = true;
    },
    rowDeleteClicked: function (item, index) {
      this.$store.dispatch(
        "changeProjectDir",
        this.projectsName[index].Projects
      );
      this.deletingProject = this.projectsName[index].Projects;
    },
    handleProjectDelete: function (bvModalEvt) {
      if (this.deletingProject === null) {
        bvModalEvt.preventDefault();
      } else {
        this.$store.dispatch("deleteProject", this.deletingProject);
      }
    },
    deleteProject: function () {
      this.getAllProjects();
    },
    getAllProjects: function () {
      this.$store.dispatch("reqProjects").then(
        () => {
          console.log(
            "Got some data, now lets show something in this component"
          );
          var projectNames = this.$store.getters.getProjects;
          while (this.projectsName.length) {
            this.projectsName.pop();
            this.selectedMenu = 1;
          }
          projectNames.forEach(
            function (item) {
              this.projectsName.push({
                Projects: item,
              });
            }.bind(this)
          );
        },
        () => {
          console.error(
            "Got nothing from server. Prompt user to check internet connection and try again"
          );
        }
      );
    },
    async listDirectoriesFromUSB() {
      const res = await axiosInstance.get("/getDirectories");
      if (res) {
        if (res.data.status === "error") {
          this.$bvToast.toast(res.data.message, {
            title: "Error!",
            autoHideDelay: 3000,
          });
        } else if (res.data.status === "success") {
          this.projectsfromUSB = res.data.data.map((e) => ({
            Project: e,
          }));
        }
      }
    },
    onSelectDirectory(items) {
      if (items && items.length > 0) {
        this.directorySelected = items[0]["Project"];
      }
    },
    async loadFromUSB() {
      if (this.directorySelected) {
        const res = await axiosInstance.post("/loadFromUSB", {
          projectName: this.directorySelected,
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
            this.$store.dispatch("changeProjectDir", this.directorySelected);
            this.$store.dispatch("reqImages");
            this.loadWorkspace();
            this.directorySelected = null;
          }
        }
      }
    },
    async loadAllFromUSB() {
      this.isLoading = true;
      const res = await axiosInstance.post("/loadAllFromUSB");
      this.isLoading = false;
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
    },
    async saveToUSB() {
      if (this.getProjectDir) {
        this.isSaving = true;
        const res = await axiosInstance.post("/saveToUSB", {
          projectName: this.getProjectDir,
        });
        this.isSaving = false;
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

        var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        let domToPretty = Blockly.Xml.domToPrettyText(xml);
        axiosInstance
          .post("saveXML", {
            filename: this.getProjectDir + "/test1.xml",
            data: domToPretty,
          })
          .then((response) => {
            console.log(response.data);
            //this.isProjectLoaded = true
          });
      }
    },
    async ejectUSB() {
      const res = await axiosInstance.post("/ejectUSB");
      if (res) {
        this.$bvToast.toast(res.data.message, {
          title: "Success!",
          autoHideDelay: 3000,
        });
      }
    },

    async wifiConnect() {
      const res = await axiosInstance.post("/listWifi");
      if (res) {
        var ap = res.data.ap;
        this.ap_names = ap.reduce((acc, cur) => {
          if (!acc.find((e) => e.value === cur.ssid))
            acc.push({
              value: cur.ssid,
              text: cur.ssid,
            });
          return acc;
        }, []);

        this.$bvModal.show("wifi_conn");
      }
    },

    async connectToWifi() {
      const res = await axiosInstance.post("/wifiConnect", {
        ssid: this.selected_ssid,
        password: this.wifi_password,
      });

      if (res) {
        this.currentWifi = this.selected_ssid;
      }
    },

    async getCurrentWifi() {
      const res = await axiosInstance.get("/wifi/current");
      if (res && res.data) {
        const ap = res.data.ap;
        const wlan = ap.find((item) => item.iface === "wlan0");
        if (wlan) {
          this.currentWifi = wlan.ssid;
        }
      }
    },
    importFile() {
      // This function will be developed in the near future in order to import project from a data storage.
      console.log("This function is not available at this time.");
    },

    checkFormValidity() {
      const valid = this.$refs.form.checkValidity();
      this.nameState = valid ? true : false;
      return valid;
    },
    resetModal() {
      this.projectDirIn = "";
      this.nameState = null;
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      this.handleSubmit();
    },
    handleSelect(type) {
      this.typeSelect = type;
    },
    handleSelectSubmit() {
      this.$store.dispatch("setTrainingType", this.typeSelect);
    },
    handleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return;
      }
      this.$store.dispatch("setProjectDir", {
        name: this.projectDirIn,
        type: this.typeSelect,
      });
      // Hide the modal manually
      if (this.typeSelect !== "None" && this.projectDirIn !== "None") {
        this.$nextTick(() => {
          this.$refs.modal.hide();
          this.selectedMenu = 1;
          this.handleSelectSubmit();
          this.$store.dispatch("changeProjectDir", this.projectDirIn);
        });
      } else {
        console.log("Training type is required.");
      }
      this.$store.dispatch("clearBlocklyWorkspace");
    },
    openProject(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      this.selectedProjectType();
    },
    selectedProjectType() {
      if (this.typeSelect !== "None" && this.projectDirIn !== "None") {
        this.handleSelectSubmit();
        this.$store.dispatch("changeProjectDir", this.projectDirIn);
        this.$nextTick(() => {
          this.$refs.openModal.hide();
          this.loadWorkspace();
          this.isProjectLoaded = false;
          if (this.getTrainingType === "Sound") {
            this.$store.dispatch("reqAudios");
            this.$store.dispatch("reqAudiosClasses");
          } else if (this.getTrainingType === "Object detection") {
            this.$store.dispatch("reqImages", true);
          } else {
            this.$store.dispatch("reqImages", false);
            this.$store.dispatch("reqImagesClasses");
          }
        });
      } else {
        console.log("Training type is required.");
      }
    },
    resetOpenModal() {
      // --clear filled form --
    },
    handleTabChange(tabIndex) {
      // Because without using v-tab, Then index start with 1
      this.selectedMenu = tabIndex;
      if (tabIndex === 1 && this.loaded === false) {
        this.isRunHiden = false;
      }
      if (tabIndex === 4) {
        this.isRunHiden = true;
      } else {
        this.isRunHiden = false;
      }

      if (tabIndex === 2) {
        if (this.getTrainingType === "Object detection") {
          axiosInstance
            .post("/getAnotaions", {
              projectpath: this.getProjectDir,
            })
            .then((response) => {
              while (this.$refs.anotateComponent.classes.length) {
                this.$refs.anotateComponent.classes.pop();
              }

              var info1 = response.data.classes;
              var index1, len1;
              for (index1 = 0, len1 = info1.length; index1 < len1; ++index1) {
                this.$refs.anotateComponent.classes.push({
                  Label: info1[index1],
                });
              }
            });
        }
      }
    },

    showCode() {
      console.log("Hello world code!!!!! b4");
      this.code = blocklyPython.workspaceToCode(this.blockly_woakspace);
      //blocklyPython.workspaceToCode(this.blockly_woakspace).then((returnVal) => {
      //    console.log(returnVal.data.data)
      //})
      this.$refs.blocklyComponent.result = "";
      console.log("Hello world code!!!!!");
      this.isRunning = true;
      axiosInstance
        .post("run", {
          filename: this.getProjectDir + "/test1.py",
          data: this.code,
        })
        .then((response) => {
          console.log(response.data);
          this.isProjectLoaded = true;
          //this.url = "http://192.168.88.243:8080/stream?topic=/output/image_detected&type=ros_compressed"
          this.$refs["pyhonLoading"].show();
          /* setTimeout(() => {

                                         this.url = "http://" + this.ipAddress + ":8080/stream?topic=/output/image_detected&type=ros_compressed"
                                         //this.url = "http://0.0.0.0:8080/stream?topic=/output/image_detected&type=ros_compressed"
                                         this.$refs.displayImage.src = this.url
                                         this.$refs['pyhonLoading'].hide()
                                         console.log(this.url)
                                     }, 12000)*/

          var timerId, percent;
          percent = 0;
          timerId = setInterval(() => {
            // increment progress bar
            percent += 1;
            console.log(percent);
            this.value = percent;

            // complete
            if (percent >= 24) {
              clearInterval(timerId);

              this.$refs["pyhonLoading"].hide();
            }
          }, 500);
          //this.url = "https://picsum.photos/250/250/?image=59"
        });
      console.log(this.code);
    },

    stopRun() {
      axiosInstance
        .post("stop", {
          filename: this.getProjectDir + "/test1.py",
          data: this.code,
        })
        .then((response) => {
          console.log(response.data);
          this.isProjectLoaded = false;
          this.isRunning = false;
        });
    },
    saveWorkspace() {
      var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
      let domToPretty = Blockly.Xml.domToPrettyText(xml);
      axiosInstance
        .post("saveXML", {
          filename: this.getProjectDir + "/test1.xml",
          data: domToPretty,
        })
        .then((response) => {
          console.log(response.data);
          //this.isProjectLoaded = true
        });
      console.log(xml);
    },
    loadWorkspace() {
      this.$store.dispatch("clearBlocklyWorkspace");

      axiosInstance
        .post("getXML", {
          filename: this.getProjectDir + "/test1.xml",
        })
        .then((response) => {
          /*var xml = Blockly.Xml.textToDom(response.data)
                          console.log(xml)
                          Blockly.mainWorkspace.clear();
                          Blockly.Xml.domToWorkspace(Blockly.workspace, xml)*/

          this.$store.commit("setBlocklyXml", response.data);

          //Blockly.mainWorkspace.clear();

          //let textToDom = Blockly.Xml.textToDom(response.data);
          //Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, textToDom);

          //console.log(xml)
          //this.isProjectLoaded = true
        });
    },

    onForward: function () {
      // var x = 0
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

        this.$store.getters.getCmdVel.publish(twist);
        //console.log(this.cmdVel);
      }
    },

    onBackward: function () {
      // var x = 0
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

        this.$store.getters.getCmdVel.publish(twist);
        //console.log(this.cmdVel);
      }
    },
    onLeft: function () {
      // var x = 0
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

        this.$store.getters.getCmdVel.publish(twist);
        //console.log(this.cmdVel);
      }
    },

    onRight: function () {
      // var x = 0
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

        this.$store.getters.getCmdVel.publish(twist);
        //console.log(this.cmdVel);
      }
    },
    onCCW: function () {
      // var x = 0
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

        this.$store.getters.getCmdVel.publish(twist);
        //console.log(this.cmdVel);
      }
    },

    onCW: function () {
      // var x = 0
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

        this.$store.getters.getCmdVel.publish(twist);
        //console.log(this.cmdVel);
      }
    },

    getBlock() {},
  },
  mounted() {
    this.$store.dispatch("reqProjects");
    this.getCurrentWifi();

    this.cmdVel = this.getCmdVel;

    let uri = "getIP";

    console.log("Start roslibjs");

    // eslint-disable-next-line no-undef
    this.rbServer = new ROSLIB.Ros();
    this.rbServer.on("error", function (error) {
      this.connected = "Connection error" + error;
      console.log("Connection error");
    });

    this.rbServer.on(
      "close",
      function () {
        this.connected = "Disconnected event";
        console.log("Connection closed");
      }.bind(this)
    );

    this.rbServer.on(
      "connection",
      function () {
        console.log("Connected to ROS");
        this.connected = "Connected";

        // eslint-disable-next-line no-undef
        this.cmdVel = new ROSLIB.Topic({
          ros: this.rbServer,
          name: "/cmd_vel",
          messageType: "geometry_msgs/Twist",
        });

        // subscribe topic
        this.cmdVel.subscribe(
          function (message) {
            console.log("Received message on " + ": " + message.data);
          }.bind(this)
        );

        let audio_int_topic = new ROSLIB.Topic({
          ros: this.rbServer,
          name: "/audio_int",
          messageType: "kidbright_tpu/int1d",
        });

        audio_int_topic.subscribe(
          function (message) {
            this.$store.dispatch("setRealtimeSound", message.data);
          }.bind(this)
        );

        let inference_topic = new ROSLIB.Topic({
          ros: this.rbServer,
          name: "/inference",
          messageType: "std_msgs/String",
        });

        inference_topic.subscribe(
          function (message) {
            this.$store.dispatch("setInference", message.data);
          }.bind(this)
        );

        this.$store.dispatch("setCmdVel", this.cmdVel);

        this.$store.commit("setRbServer", this.rbServer);

        let std_out_topic = new ROSLIB.Topic({
          ros: this.rbServer,
          name: "/std_out",
          messageType: "std_msgs/String",
        });

        std_out_topic.subscribe(
          function (message) {
            console.log("Received message on " + ": " + message.data);
            if (message.data === "DONE") {
              this.isRunning = false;
              this.isProjectLoaded = false;
            }
            this.$refs.trainLocalComponent.result += message.data + "<br />";
          }.bind(this)
        );

        let std_out_python_topic = new ROSLIB.Topic({
          ros: this.rbServer,
          name: "/std_out_python",
          messageType: "std_msgs/String",
        });

        std_out_python_topic.subscribe(
          function (message) {
            var d = new Date();
            var n = d.getTime();
            console.log("Received message on " + ": " + message.data);
            if (message.data === "DONE") {
              this.isProjectLoaded = false;
              this.isRunning = false;
            }
            this.$refs.blocklyComponent.s_result =
              n + ": " + message.data + "<br />";
          }.bind(this)
        );
      }.bind(this)
    );

    axiosInstance.get(uri, axios_options).then((response) => {
      this.rbServer.connect("ws://" + response.data.IP + ":9090");
      console.log("ROS IP = " + response.data.IP);
    });
  },
  computed: {
    ...mapGetters([
      "getProjectDir",
      "getProjects",
      "getImages",
      "getProjectStatus",
      "getCmdVel",
      "getTrainingType",
      "getBlocklyWorkspace",
      "getActiveDevice",
      "getAudios",
    ]),
    getImgSrc: function () {
      return this.url;
    },
    saveButton: function () {
      return this.isSaving ? "Saving..." : "Save to usb";
    },
    shouldAnnotateEnable: function () {
      return (
        this.getProjectDir !== "None" &&
        (this.getTrainingType === "Sound"
          ? this.getAudios.length > 0
          : this.getImages.length > 0)
      );
    },
    shouldTrainEnable: function () {
      return (
        this.shouldAnnotateEnable &&
        (this.getTrainingType === "Sound"
          ? this.getAudios.find((item) => item.isAnnotated)
          : this.getImages.find((item) => item.isAnnotated))
      );
    },
  },
  props: {
    msg: String,
  },
};
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;
$black: #333;
$yellow: #fff7d6;
$grey: #eeeeee;

* {
  margin: 0;
  padding: 0;
  outline: none;
  box-sizing: border-box;
}

.p-color {
  color: $primary-color;
  font-weight: 800;
}

.p-notice-color {
  color: red;
}

ul {
  list-style: none;
  padding: 0;
}

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.container-fluid {
  padding: 0;
}

.main-bg {
  background-color: #eeeeee;
}

.content-panel {
  overflow-y: auto;
  width: calc(100% - 320px);
}

.left-panel {
  padding: 8px;
  max-width: 320px;
  width: 320px;
  min-width: 320px;
  overflow-y: auto;

  .l-title {
    color: #06754b;
    font-size: 35px;
    text-align: center;
  }

  .left-bottom-content {
    position: relative;
    background-color: #fff7d6;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    margin: 10px 8px;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    height: calc(100% - 8px - 52px - 65px - 20px);
    overflow: hidden;

    .proj-name {
      display: flex;
      align-items: center;
      margin-bottom: 0px;
      color: #eeeeee;
      font-size: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .proj-type {
      color: #ffff78;
      font-size: 14px;
      margin-bottom: 0.5em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .step {
      display: flex;
      flex-wrap: wrap;
      margin: 10px 0;
      padding: 0 20px;
      width: 100%;
      height: 246px;

      li {
        flex: 1 0 50%;
        padding: 5px;
        opacity: 1;
        filter: sepia(1);
        cursor: pointer;
        transition: opacity 0.3s ease-in, filter 0.3s ease-in;

        &.inactive {
          opacity: 0.7;
          filter: sepia(1) !important;
          cursor: unset !important;
        }

        &.current {
          filter: sepia(0) !important;
        }

        &:hover {
          filter: sepia(0.5);
        }

        img {
          width: 100%;
        }
      }
    }

    .hint {
      width: calc(100% - 20px);
      height: calc(100%);
      margin: 0 10px 10px;
      text-align: left;
      //height: 53%;
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      position: relative;
      background: white;
      border-radius: 20px;
      overflow-y: auto;

      &::after {
        content: "";
        position: absolute;
        top: 20px;
        left: 40px;
        width: 75px;
        height: 114px;
        background: url("../assets/UI/svg/light-bulb.svg") center no-repeat;
        background-size: 75px 114px;
        opacity: 0.5;
      }

      // overflow-y: scroll;
      .main-hint {
        padding: 1em;
        z-index: 1;

        &.notype {
          //height: 100%;
          //margin-top: 20px;
        }
      }

      .btn-desc {
        margin-bottom: 10px;

        li {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          height: 23px;
          margin-left: -7px;
        }

        span {
          width: 32px;
          display: flex;
          justify-content: center;
          margin-right: 5px;
        }
      }

      p {
        font-size: 0.8rem;

        img {
          height: 30px;
        }
      }
    }

    .mascot {
      width: 100%;
      text-align: center;
      img {
        width: 150px;
      }
    }
  }

  .menu-starter {
    display: flex;
    justify-content: center;
    > div {
      margin: 5px;
    }
  }

  .btn-base {
    width: 55px;
    height: 55px;
    background-position: center center;
    background-size: cover;
    cursor: pointer;

    &:hover {
    }

    &.new {
      background-image: url("../assets/UI/png/Group 187.png");
    }

    &.open {
      background-image: url("../assets/UI/png/Group 185.png");
    }

    &.save {
      background-image: url("../assets/UI/png/Group 186.png");
    }

    &.delete {
      background-image: url("../assets/UI/png/Group 188.png");
    }

    &.eject {
      background-image: url("../assets/UI/png/Group 108.png");
    }

    &.import {
      background-image: url("../assets/UI/png/Group 121.png");
      opacity: 0.5;
    }

    &.wifi {
      background-image: url("../assets/UI/png/Group 122.png");
    }
  }
}

.sub-panel {
  background-color: #333333;
  padding: 16px;
  color: white;
  width: 240px;
  max-width: 240px;
}

.container {
  max-width: 100%;
  min-width: 100%;
  max-height: 100%;
  min-height: 100%;
  margin: 0px auto;
  font-size: 0.9em;
  color: #888;
}

#blocklyDiv {
  position: absolute;
  height: 100%;
  width: 100%;
  margin-left: 33.33%;
}

[data-md-tooltip] {
  position: relative;
}

[data-md-tooltip]:before {
  content: attr(data-md-tooltip);
  position: absolute;
  top: -35px;
  left: 50%;
  padding: 8px;
  transform: translateX(-50%) scale(0);
  transition: transform 0.2s ease-in-out;
  transform-origin: top;
  background-color: #fff7d6;
  color: #333;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 400;
  z-index: 9999;
  width: 120%;
  opacity: 1 !important;
  text-align: center;
}

[data-md-tooltip]:hover:before {
  transform: translateX(-50%) scale(1);
  z-index: 9999;
}
</style>
<style lang="scss">
.mode-select {
  .btn {
    color: unset;
    border: unset;
    background-color: unset;
    text-align: left;
    position: relative;

    &::after {
      position: absolute;
      top: 17px;
      right: 15px;
    }
  }
}

::-webkit-scrollbar {
  width: 7px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  // background-color: rgba(0, 0, 0, 0.2);
  background-color: #007e4e;
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.mode-select {
  margin: 0;
  margin-bottom: 10px;
  width: 100%;
  background: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;

  .btn {
    background-color: #fff;
  }
}

.header-left-bar {
  z-index: 1;
  position: relative;
  display: block;
  background: #007e4e;
  width: 100%;
  padding: 10px 15px;
  height: 102px;
  .header-action-button {
    display: flex;
    button {
      background: #003722;
      border: none;
      font-size: 10px;
      border-radius: 15px;
      text-transform: capitalize;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &:nth-of-type(1) {
        margin-right: 5px;
      }
      svg {
        width: 12px;
        height: 12px;
        margin-right: 3px;
      }
    }
    .connection-robot {
      background-color: #1a3700;
      color: #f7ff00;
      svg {
        fill: #f7ff00;
      }
    }
    .connection-computer {
      background-color: #003137;
      color: #00fff6;
      svg {
        fill: #00fff6;
      }
    }
    .text-green {
      color: #00ff77;
      svg {
        fill: #00ff77;
      }
    }
    .inactive {
      color: #517a52;
      svg {
        fill: #517a52;
      }
    }
    .img-icon {
      // width: 1em;
      height: 1em;
    }
  }
}
</style>
