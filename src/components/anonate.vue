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
          <div
            class="position-relative"
            v-if="typeof imageActiveIndex === 'number'"
          >
            <clipper-basic
              ref="clipper"
              id="my-clipper"
              class="my-clipper"
              :src="imSrc"
              @load="loadCb"
            ></clipper-basic>
            <div v-if="showBound" :style="drawBox">
              {{ annotationName }}
            </div>
          </div>
          <div class="img-counter">
            <span class="current-img">{{
              typeof imageActiveIndex === "number"
                ? `${imageActiveIndex + 1}`
                : null
            }}</span
            ><span v-if="typeof imageActiveIndex === 'number'" class="ov-img"
              >/ {{ images.length }} IMAGES</span
            >
            <span v-else class="ov-img">{{ images.length }} IMAGES</span>
          </div>
        </div>
        <div class="img-slider">
          <div
            :id="id"
            :class="{ img: true, active: imageActiveIndex === id }"
            v-for="(file, id) in images"
            :key="id"
            v-on:click="onSelect($event)"
          >
            <img class="thumb" :src="file.file" alt="" srcset="" /><span
              v-if="file.isAnnotated === 1"
              class="annotated-btn count"
              >{{ file.classCounts }}</span
            >
          </div>
        </div>
      </div>

      <div class="side-panel">
        <div class="w-100">
          <h4 class="side-panel-ttl">LABEL</h4>
          <div class="feature-wrap">
            <button @click="onNewLabel" class="btn btn-light new-label w-100">
              New label
              <img
                src="../assets/UI/png/+.png"
                alt=""
                style="position: absolute; right: 15px"
                srcset=""
              />
            </button>
            <div class="pills w-100">
              <button
                type="button"
                v-for="(cls, index) in classes"
                :key="'B' + index"
                @click="selectLabel(cls.Label)"
                class="btn added-label w-100"
              >
                {{ cls.Label }}
                <div
                  style="position: absolute; right: 15px"
                  class="right-group"
                >
                  <img
                    src="../assets/UI/svg/interface.svg"
                    height="26"
                    alt=""
                    class="interface-btn"
                    srcset=""
                  />
                  <img
                    class="ml-2"
                    src="../assets/UI/png/Group 114.png"
                    @click.stop="deletetLabel(index)"
                    height="22"
                    alt=""
                    srcset=""
                  />
                </div>
              </button>
            </div>
          </div>
          <h4 class="side-panel-ttl">ANNOTATE</h4>
          <div class="feature-wrap">
            <div class="annotate-cn-list w-100">
              <div
                v-for="(object, index1) in anotate.annotation.object"
                :key="'A' + index1"
                :class="{
                  'annotate-cn': true,
                  active: anotaionActiveIndex === index1,
                }"
                @click="boxRowClicked(object, index1)"
              >
                <div class="annotate-cn-list-ttl">
                  <img
                    src="../assets/UI/svg/Group 177_green.svg"
                    alt=""
                    srcset=""
                  />
                  <img
                    src="../assets/UI/svg/Group 177_white.svg"
                    alt=""
                    srcset=""
                  />
                  {{ object.name }}
                </div>
                <div class="annotate-cn-list-content">
                  <div
                    class="d-flex flex-fill flex-column justify-content-between text-right"
                  >
                    <div class="annotation-txt">
                      X:{{ object.bndbox.xmin }},Y:{{ object.bndbox.ymin }}
                    </div>
                    <div class="annotation-txt">
                      X:{{ object.bndbox.xmin }},Y:{{ object.bndbox.ymax }}
                    </div>
                  </div>
                  <img
                    src="../assets/UI/png/interface-1.png"
                    width="60"
                    class="ml-1 mr-1"
                    alt=""
                    srcset=""
                  />
                  <div
                    class="d-flex flex-fill flex-column justify-content-between text-left"
                  >
                    <div class="annotation-txt">
                      X:{{ object.bndbox.xmax }},Y:{{ object.bndbox.ymin }}
                    </div>
                    <div class="annotation-txt">
                      X:{{ object.bndbox.xmax }},Y:{{ object.bndbox.ymax }}
                    </div>
                  </div>
                </div>
                <img
                  src="../assets/UI/png/cancel.png"
                  height="24"
                  @click.stop="deleteBox(index1)"
                  class="cancel-btn op-btn"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="w-100">
          <!-- <div class="next op-btn" @click="onClick" v-on:click.prevent>
                    <span>TRAINING</span>
                    <span class="ico"><img src="../assets/UI/svg/up-arrow.svg" alt="" srcset=""></span>
                </div> -->
        </div>
      </div>
    </div>

    <b-modal
      ref="class-modal"
      id="anotateDiaglog"
      title="ADD LABEL"
      modal-class="my-modal-class"
      hide-footer
    >
      <b-form @submit="onSubmit" @reset="onReset">
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
            <b-col md="4" class="ml-md-auto">
              <b-button pill block type="reset" variant="danger"
                >Reset</b-button
              >
            </b-col>
          </b-form-row>
        </b-container>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { clipperBasic } from "vuejs-clipper";
import { Multipane, MultipaneResizer } from "vue-multipane";

import "vuejs-clipper/dist/vuejs-clipper.css";
import axios from "axios";
import { mapGetters } from "vuex";

var convert = require("xml-js");

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3001`,
});

export default {
  name: "Anotate",
  components: {
    clipperBasic,
    Multipane,
    MultipaneResizer,
  },
  props: {},
  created() {},
  data() {
    return {
      imageActiveIndex: undefined,
      anotaionActiveIndex: undefined,
      form: {
        name: "",
      },
      sortBy: "name",
      bndFields: [
        {
          key: "name",
          sortable: false,
        },
        {
          key: "bndbox",
          sortable: false,
        },
        {
          key: "Actions",
        },
      ],
      imageFields: [
        {
          key: "file",
          sortable: false,
        },
      ],
      fullPath: "",
      projectDir: "",
      imFolder: "",
      images: [],
      selectedFile: "",
      selectedPath: "",
      classes: [],
      classesFields: [
        {
          key: "Label",
        },
        {
          key: "actions",
          label: "Actions",
        },
      ],
      modes: ["multi", "single", "range"],
      selectMode: "single",
      selected: [],
      im_file: "",
      selectedIndx: 3,
      imSrc: "./round_image_black_48dp.png",
      options: {},
      sel: {},
      anotate: {
        annotation: {
          folder: " ",
          filename: " ",
          path: " ",
          source: {
            database: "Unknown",
          },
          size: {
            width: 500,
            height: 300,
            depth: 3,
          },
          segmented: 0,
          object: [],
        },
      },
      info: [],
      anotationWidth: 100,
      anotationHeight: 100,
      anotationX: 0,
      anotationY: 0,
      annotationName: "",
      showBound: false,
      savedXmlFilename: "",
    };
  },
  methods: {
    saveAnotationFile: async function () {
      var options = {
        compact: true,
        ignoreComment: true,
        spaces: 4,
      };
      var result = convert.json2xml(this.anotate, options);
      var imPath =
        "/" + this.$store.getters.getProjectDir + "/" + this.imFolder + "/";
      var xmlFileName =
        imPath + this.selectedFile.replace(/\.[^/.]+$/, "") + ".xml";
      this.savedXmlFilename =
        "Anotated file is saved as " +
        this.selectedFile.replace(/\.[^/.]+$/, "") +
        ".xml";
      console.log(result);

      await axiosInstance
        .post("/writeXml", {
          filename: xmlFileName,
          data: result,
        })
        .then((response) => {
          console.log(response.data);
          if (response.data.status === "OK") {
            console.log("File is OK!!!!");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    selectLabel: function (label) {
      const canvas = this.$refs.clipper.clip();
      const pos = this.$refs.clipper.getDrawPos();

      this.anotate.annotation.object.push({
        name: label,
        pose: "Unspecified",
        truncated: 0,
        difficult: 0,
        bndbox: {
          xmin: Math.floor(pos.pos.sx),
          ymin: Math.floor(pos.pos.sy),
          xmax: Math.floor(pos.pos.sx + pos.pos.swidth),
          ymax: Math.floor(pos.pos.sy + pos.pos.sheight),
        },
      });

      axiosInstance
        .post("/addClass", {
          class: "labeled",
          file: this.selectedFile,
          classCounts: this.anotate.annotation.object.length,
          projectpath: this.$store.getters.getProjectDir,
        })
        .then((response) => {
          if (response.data.status === "OK") {

            this.images[this.imageActiveIndex].isAnnotated = 1;
            this.images[this.imageActiveIndex].class = "labeled";
            this.images[
              this.imageActiveIndex
            ].classCounts = this.anotate.annotation.object.length;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    onBeforeChange: function (oldSlideIndex, newSlideIndex) {
      console.log("Before change");
    },
    deletetLabel: function (index) {
      axiosInstance
        .post("/removeImclassAnotaion", {
          dirname: this.classes[index].Label,
          projectpath: this.$store.getters.getProjectDir,
        })
        .then((response) => {
          if (response.data.status === "OK") {
            console.log("File is OK!!!!");
            this.classes.splice(index, 1);
          } else {
            console.log("File is FAIL!!!!");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    onNewLabel: function () {
      this.$refs["class-modal"].show();
    },
    imageSrc: function () {
      console.log(this.images[this.selectedIndx].file);
      return this.images[this.selectedIndx].file;
    },
    onSelect: function (event) {
      var targetId = event.currentTarget.id;
      var index = Number(targetId);
      this.imageActiveIndex = index;
      var previous_selectedFile = this.selectedFile;

      if (this.anotate.annotation.object.length > 0) {
        console.log("Save anotation file");
        var options = {
          compact: true,
          ignoreComment: true,
          spaces: 4,
        };
        var result = convert.json2xml(this.anotate, options);
        var imPath =
          "/" + this.$store.getters.getProjectDir + "/" + this.imFolder + "/";
        var xmlFileName =
          imPath + previous_selectedFile.replace(/\.[^/.]+$/, "") + ".xml";
        this.savedXmlFilename =
          "Anotated file is saved as " +
          previous_selectedFile.replace(/\.[^/.]+$/, "") +
          ".xml";
        console.log(result);

        axiosInstance
          .post("/writeXml", {
            filename: xmlFileName,
            data: result,
          })
          .then(async (response) => {
            console.log(response.data);
            if (response.data.status === "OK") {
              console.log("File is OK!!!!");
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        console.log("No anotaion");
      }

      console.log("pop array");

      while (this.anotate.annotation.object.length) {
        this.anotate.annotation.object.pop();
      }

      this.showBound = false;
      console.log("Hello");
      console.log(index);
      //console.log(this.images[index].file)
      console.log(this.images[index]);
      console.log(this.images[index].file);
      this.imSrc = this.images[index].file;
      this.selectedFile = this.images[index].fileName;
      this.imFolder = "images";
      var imPath =
        "/" + this.$store.getters.getProjectDir + "/" + this.imFolder + "/";
      var xmlFileName =
        imPath + this.selectedFile.replace(/\.[^/.]+$/, "") + ".xml";
      console.log("xmlFileName = ");
      console.log(xmlFileName);

      axiosInstance
        .post("/checkXmlFile", {
          filename: xmlFileName,
        })
        .then(
          function (response) {
            console.log(response.data.status);

            //console.log(JSON.stringify(jobj));
            if (response.data.status === "OK") {
              var jobj = JSON.parse(response.data.data);
              if (Array.isArray(jobj.annotation.object)) {
                console.log("it is an array");

                //this.anotate.annotation.object = jobj.annotation.object;
                jobj.annotation.object.forEach((value, index, array) => {
                  this.anotate.annotation.object.push(value);
                });
              } else {
                this.anotate.annotation.object.push(jobj.annotation.object);
                console.log("it is not array");
              }

              console.log(JSON.stringify(this.anotate));
              console.log("OK");
              //console.log(JSON.stringify(jobj.data));
            } else {
              console.log("FAIL");
            }
          }.bind(this)
        )
        .catch(function (error) {
          console.log(error);
        });
      return (this.selectedIndx = index);
    },
    onClick: function () {
      console.log("Click");
      //this.images = this.$store.getters.getImages;
      console.log(this.images);
    },
    rowSelected(items) {
      console.log(items);
      return (this.selected = items);
    },

    anotateFunc: function (row) {
      console.log("Label = " + row.item.Label);
      const canvas = this.$refs.clipper.clip();
      console.log(canvas);
      const pos = this.$refs.clipper.getDrawPos();
      console.log(pos);
      console.log(pos.pos.sx);
      console.log(pos.pos.sy);

      this.anotate.annotation.object.push({
        name: row.item.Label,
        pose: "Unspecified",
        truncated: 0,
        difficult: 0,
        bndbox: {
          xmin: Math.floor(pos.pos.sx),
          ymin: Math.floor(pos.pos.sy),
          xmax: Math.floor(pos.pos.sx + pos.pos.swidth),
          ymax: Math.floor(pos.pos.sy + pos.pos.sheight),
        },
      });
      console.log(this.anotate.annotation.object);
      console.log("Done anotation!!!!!!");
    },
    deleteBox: function (row) {
      this.anotate.annotation.object.splice(row, 1);
      this.images[
        this.imageActiveIndex
      ].classCounts = this.anotate.annotation.object.length;
    },
    delAnotateFunc: function () {
      this.anotate.annotation.object.pop();
    },
    loadCb: function () {
      var imsr = this.imageSrc();

      this.anotate.annotation.filename = this.selectedFile;
      this.anotate.annotation.folder = this.imFolder.substr(
        1,
        this.imFolder.length
      );
      this.anotate.annotation.path = this.fullPath + "/client/" + imsr; //imsr.substr(1, imsr.length);
      if (this.images === undefined || this.images.length == 0) {
        // array empty or does not exist
      } else {
        var img = new Image();
        img.src = this.imageSrc();

        img.onload = function () {
          // here you got the width and height
          this.anotate.annotation.size.width = img.width;
          this.anotate.annotation.size.height = img.height;
        }.bind(this);

        img.onerror = function () {
          console.log("Load image error");
        }.bind(this);
      }
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.classes.push({
        Label: this.form.name,
      });

      axiosInstance
        .post("/imclassAnotaion", {
          dirname: this.form.name,
          projectpath: this.getProjectDir,
        })
        .then((response) => {
          console.log(response.data);
          if (response.data.status === "OK") {
            console.log("File is OK!!!!");
          } else {
            console.log("File is FAIL!!!!");
          }
        })
        .catch((error) => {
          console.log(error);
        });
      console.log(this.classes);
      this.$refs["class-modal"].hide();
    },
    onReset: function () {},
    boxRowClicked: function (item, index) {
      this.anotaionActiveIndex = index;
      console.log("Anotation click!!!!!!");
      console.log(this.anotate.annotation.object[index]);
      this.showBound = true;
      var selectedObj = this.anotate.annotation.object[index];
      this.annotationName = selectedObj.name;
      this.anotationX = selectedObj.bndbox.xmin;
      this.anotationY = selectedObj.bndbox.ymin;
      this.anotationWidth = selectedObj.bndbox.xmax - selectedObj.bndbox.xmin;
      this.anotationHeight = selectedObj.bndbox.ymax - selectedObj.bndbox.ymin;
    },
    /*listFiles: function () {
                while (this.images.length) {
                    this.images.pop();
                }
                let uri = 'getFiles';
                axios.post(uri, {
                    path: this.$store.state.projectDir
                }).then((response) => {
                    this.info = response.data.files;
                    this.projectDir = response.data.projectDir;
                    this.imFolder = response.data.folder;
                    this.fullPath = response.data.fullPath
                    var index, len;
                    for (index = 0, len = this.info.length; index < len; ++index) {
                        var imPath = response.data.projectDir + response.data.folder + "/" + this.info[index].file;
                        this.images.push({
                            fileName: this.info[index].file,
                            file: imPath,
                            id: this.info[index].id
                        })
                    }

                    console.log(response.data.files)
                });

            },*/
  },
  directives: {},
  mounted() {
    console.log("Anotation");
    this.images = this.getImages;
    console.log(this.images);
    this.projectDir = this.getProjectDir;
  },
  computed: {
    ...mapGetters(["getProjectDir", "getImages"]),
    drawBox() {
      const h = this.$refs.clipper.imgEl.naturalHeight;
      const scale_h = document.getElementById("my-clipper").clientHeight;
      var sty =
        "position: absolute;" +
        "top: 0;" +
        "left: 0;" +
        "width: " +
        Math.floor((this.anotationWidth * scale_h) / h) +
        "px;" +
        "height: " +
        Math.floor((this.anotationHeight * scale_h) / h) +
        "px;" +
        "margin-top: " +
        Math.floor((this.anotationY * scale_h) / h) +
        "px;" +
        "margin-left: " +
        Math.floor((this.anotationX * scale_h) / h) +
        "px;" +
        "display: none;" +
        "color: #FFF;" +
        "display: block;" +
        "background: rgba(0, 0, 0, .5);";

      return sty;
    },

    getImagesData() {
      this.images = this.$store.getters.getImages;
      console.log(this.images);
      return this.images;
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
  }

  .annotation-txt {
    color: $primary-color;
    font-size: 12px;
    font-weight: bold;
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

.right-panel-cn {
  overflow-y: auto;
}

.interface-btn {
  &:hover {
    color: white;
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

.badge {
  background-color: white;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  padding: 2px;
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
    background: #cdcdcd;
    padding: 10px 20px;
    margin-bottom: 10px;
  }
  .feature-wrap {
    padding: 0 20px 10px;
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

/*.slick-slider {
    width: 500px;
    flex: 1 1 auto;

    .cancel-btn {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 30px;
        height: 30px;
    }

    .item-slider {
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
            border: 5px solid $primary-color;
            border-radius: 25px;
            pointer-events: none;
        }
    }

    div {
        outline: none;
    }

    .img {
        background-color: #2f3241;
        height: 160px;
        margin: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    ::v-deep .slick-arrow:before {
        color: #2f3241;
        font-size: 33px;
        transition: opacity 0.3s ease-in;
    }

    ::v-deep .slick-prev {
        left: -40px;
    }
}*/

.my-clipper {
  width: 100%;
  position: relative;
}

.custom-resizer {
  width: 100%;
  height: 100vh;
}

.custom-resizer > .pane {
  text-align: left;
  padding: 10px;
  overflow: hidden;
  background: #eee;
  border: 1px solid #ccc;
}

.custom-resizer > .multipane-resizer {
  margin: 0;
  left: 0;
  width: 8px;
  position: relative;
  background: #999;

  &:before {
    display: block;
    content: "";
    width: 3px;
    height: 100vh;
    position: absolute;
    top: 0%;
    left: 50%;
    margin-top: 0vh;
    margin-left: -1.5px;
    border-left: 1px solid #444;
    border-right: 1px solid #444;
  }

  &:hover {
    &:before {
      border-color: #999;
    }
  }
}

.container_middle {
  width: 100%;
  padding-right: 0px;
  padding-left: 0px;
  margin-right: 1px;
  margin-left: 1px;
}

.splitpanes {
  .splitpanes__pane {
    box-shadow: 0 0 3px rgba(185, 185, 185, 0.2) inset;
    justify-content: center;
    align-items: center;
    display: flex;
    position: relative;
  }
}

.splitpanes span {
  font-family: Helvetica, Arial, sans-serif;
  color: #f00;
  opacity: 0.7;
}

em.specs {
  font-size: 0.2em;
  line-height: 1;
  position: absolute;
  color: #999;
  bottom: 0.5em;
  left: 0;
  right: 0;
  text-align: center;
}

.multipane.foo.layout-v .multipane-resizer {
  margin: 0;
  left: 0;
  /* reset default styling */
  width: 10px;
  background: #999;
}

.vertical-panes {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
}

.vertical-panes > .pane {
  text-align: left;
  padding: 15px;
  overflow: hidden;
  background: #eee;
}

html,
body {
  height: 100%;
}

.container-fluid {
  height: 100%;
  overflow-y: hidden;
  /* don't show content that exceeds my height */
}

.body-film {
  min-height: 100%;
  overflow-y: scroll;
}

.my-table {
  max-height: 600px;
  overflow-y: scroll;
}

.fullHeight {
  height: 100%;
  background: rebeccapurple;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-container .after {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  margin-top: 30px;
  margin-left: 30px;
  display: none;
  color: #fff;
  display: block;
  background: rgba(121, 121, 121, 0.5);
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
  .annotated-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 30px;
    height: 30px;
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
}
</style>
