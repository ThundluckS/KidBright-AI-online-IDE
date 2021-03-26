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
                <p v-show="getImgSrc === null">
                  No selected image, please click on the image below to select.
                </p>
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
          <p class="desc" v-show="getImgSrc === null">
            No selected image, please click on the image below to select.
          </p>
          <div class="img-counter">
            <span class="current-img">{{
              imageActiveIndex.length > 0 ? imageActiveIndex[0] + 1 : null
            }}</span
            ><span class="ov-img"
              >{{ imageActiveIndex.length > 0 ? "/" : null }}
              {{ getImages.length }} IMAGES</span
            >
          </div>
        </div>
        <div class="img-slider">
          <div
            :id="id"
            :class="{
              img: true,
              active: imageActiveIndex.includes(id),
            }"
            v-for="(file, id) in getImages"
            :key="id"
            @click.exact="onSelect($event)"
            @click.shift="onSelectMulti($event)"
          >
            <img class="thumb" :src="'server/'+file.file" alt="" srcset="" />
            <img
              class="cancel-btn"
              src="../assets/UI/png/cancel.png"
              @click="deleteImage($event, id)"
              alt=""
              srcset=""
            />
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
                @click="selectLabel(cls.label)"
                class="btn added-label w-100"
                v-for="(cls, index) in getImagesClasses"
                :key="index"
              >
                {{ cls.label }}
                <div
                  style="position: absolute; right: 15px"
                  class="right-group"
                >
                  <img
                    class="ml-2"
                    src="../assets/UI/png/Group 114.png"
                    @click.stop="deleteLabel(index)"
                    height="22"
                  />
                </div>
              </button>
              <!-- <button type="button" class="btn added-label w-100">
                test
                <div style="position: absolute; right: 15px" class="right-group">
                  <img class="ml-2" src="../assets/UI/png/Group 114.png" height="22" alt="" srcset=""/>
                </div>
              </button>
              <button type="button" class="btn added-label w-100">
                test
                <div style="position: absolute; right: 15px" class="right-group">
                  <img class="ml-2" src="../assets/UI/png/Group 114.png" height="22" alt="" srcset=""/>
                </div>
              </button>
              <button type="button" class="btn added-label w-100">
                test
                <div style="position: absolute; right: 15px" class="right-group">
                  <img class="ml-2" src="../assets/UI/png/Group 114.png" height="22" alt="" srcset=""/>
                </div>
              </button>
              <button type="button" class="btn added-label w-100">
                test
                <div style="position: absolute; right: 15px" class="right-group">
                  <img class="ml-2" src="../assets/UI/png/Group 114.png" height="22" alt="" srcset=""/>
                </div>
              </button> -->
            </div>
          </div>
          <h4 class="side-panel-ttl">ANNOTATE</h4>
          <div class="feature-wrap">
            <div class="annotate-cn-list w-100">
              <div
                class="annotate-cn"
                v-for="(item, idx) in currentAnnotate"
                :key="'class-' + idx"
              >
                <div class="annotate-cn-list-content">
                  <img
                    class="tag"
                    src="../assets/UI/svg/Group 177_green.svg"
                    height="24"
                  />
                  <span class="annotation-txt">{{ item }}</span>
                </div>
                <img
                  class="cancel-btn op-btn"
                  src="../assets/UI/svg/cancel-icon.svg"
                  height="24"
                  @click="onRemoveLabel"
                />
              </div>
              <!-- <div class="annotate-cn">
                <div class="annotate-cn-list-content">
                  <img class="tag" src="../assets/UI/svg/Group 177_green.svg" height="24"/>
                  <span class="annotation-txt">totoro</span>
                </div>
                <img
                  class="cancel-btn op-btn"
                  src="../assets/UI/svg/cancel-icon.svg"
                  height="24"
                />
              </div> -->
            </div>
          </div>
        </div>
        <div class="w-100"></div>
      </div>
    </div>
    <b-modal
      ref="class-modal"
      id="anotateDiaglog"
      title="Add a label"
      modal-class="my-modal-class"
      hide-footer
    >
      <b-form @submit="onSubmit" @reset="onReset">
        <b-container fluid class="bv-example-row">
          <b-form-row class="mb-3">
            <b-form-input
              id="input-2"
              v-model="form.label"
              required
              placeholder="Enter label"
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
import axios from "axios";
import { mapGetters } from "vuex";

var convert = require("xml-js");

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}/server`,
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
      imageActiveIndex: [],
      anotaionActiveIndex: undefined,
      form: {
        label: "",
      },
      images: [],
      selectedFile: null,
      classes: [],
      currentAnnotate: [],
    };
  },
  methods: {
    selectLabel: async function (label) {
      const file = this.imageActiveIndex.map(
        (selected) => this.getImages[selected].fileName
      );
      axiosInstance
        .post(`/img/${this.getProjectDir}/label`, { label, file })
        .then((response) => {
          if (response.data.status === "success") {
            this.$store.dispatch("reqImages");
            this.currentAnnotate = [label];
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    onSelect: function (event) {
      var targetId = event.currentTarget.id;
      var index = Number(targetId);
      if (
        this.imageActiveIndex.length === 1 &&
        this.imageActiveIndex.includes(index)
      )
        this.imageActiveIndex = [];
      else this.imageActiveIndex = [index];
    },
    onSelectMulti: function (event) {
      var targetId = event.currentTarget.id;
      var index = Number(targetId);
      var currentIdx = this.imageActiveIndex.indexOf(index);
      if (currentIdx !== -1)
        this.imageActiveIndex = this.imageActiveIndex.filter(
          (_, idx) => idx !== currentIdx
        );
      else this.imageActiveIndex = [...this.imageActiveIndex, index];
    },
    onNewLabel: function () {
      this.$refs["class-modal"].show();
    },
    onSubmit(evt) {
      evt.preventDefault();

      axiosInstance
        .put(`/img/${this.getProjectDir}/class`, {
          label: this.form.label,
        })
        .then((response) => {
          if (!response.data.status) {
            this.$store.dispatch("setImagesClasses", response.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });

      this.$refs["class-modal"].hide();
    },
    deleteLabel: function (index) {
      // here
    },
    onReset: function () {},
    onRemoveLabel: function () {
      const file = this.getImages[this.imageActiveIndex[0]].fileName;
      axiosInstance
        .delete(`/img/${this.getProjectDir}/label/${file}`)
        .then((response) => {
          if (response.data.status === "success") {
            this.currentAnnotate = [];
            this.$store.dispatch("reqImages");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  directives: {},
  computed: {
    ...mapGetters(["getProjectDir", "getImages", "getImagesClasses"]),
    getImgSrc: function () {
      return "server/"+this.selectedFile;
    },
  },
  watch: {
    imageActiveIndex: {
      deep: true,
      handler: function (index) {
        var l = index.length;
        if (l > 0) {
          this.selectedFile = this.getImages[index[0]].file;
          if (this.getImages[index[0]].class !== "none") {
            this.currentAnnotate = [this.getImages[index[0]].class];
          } else {
            this.currentAnnotate = [];
          }
          // this.selectedAudioMFCC = this.getAudios[index[-1]].mfcc
        } else {
          this.selectedFile = null;
          this.currentAnnotate = [];
        }
      },
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

.my-clipper {
  width: 100%;
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
  .desc {
    color: #fff;
  }
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
</style>
