<template>
  <div></div>
</template>

<script>
import WaveSurfer from "wavesurfer.js";

const formatTime = (time) => {
  return [
    Math.floor((time % 3600) / 60), // minutes
    ("00" + Math.floor(time % 60)).slice(-2), // seconds
  ].join(":");
};

export default {
  props: [
    "src",
    "options",
    "play",
    "volume",
    "onEnd",
    "onSetDuration",
    "onSetCurrent",
  ],
  data() {
    return {
      waveSurfer: {},
    };
  },
  mounted() {
    let options = this.options;
    this.$nextTick(() => {
      let wsOptions = Object.assign({ container: this.$el }, options);
      this.waveSurfer = new WaveSurfer.create(wsOptions);
      if (this.src) {
        this.waveSurfer.load(this.src);
      }

      console.log(this.volume)

      this.waveSurfer.on("ready", () => {
        if (typeof this.onSetDuration !== "undefined") {
          this.onSetDuration(formatTime(this.waveSurfer.getDuration()));
        }
        if (this.play) {
          this.waveSurfer.play();
        }
      });

      this.waveSurfer.on("audioprocess", () => {
        if (typeof this.onSetCurrent !== "undefined") {
          this.onSetCurrent(formatTime(this.waveSurfer.getCurrentTime()));
        }
      });

      this.waveSurfer.on("finish", () => {
        if (typeof this.onEnd !== "undefined") {
          this.onEnd(null, -1);
        }
        if (typeof this.onSetCurrent !== "undefined") {
          this.onSetCurrent(formatTime(this.waveSurfer.getDuration()));
        }
      });
    });
  },
  beforeDestroy() {
    this.waveSurfer.destroy();
  },
  watch: {
    play: function (value) {
      if (value) {
        this.waveSurfer.play();
        this.onSetDuration(formatTime(this.waveSurfer.getDuration()));
        this.waveSurfer.on("audioprocess", () => {
          this.onSetCurrent(formatTime(this.waveSurfer.getCurrentTime()));
        });
        this.waveSurfer.on("finish", () => {
          if (typeof this.onEnd !== "undefined") {
            this.onEnd(null, -1);
          }
          if (typeof this.onSetCurrent !== "undefined") {
            this.onSetCurrent(formatTime(this.waveSurfer.getDuration()));
          }
        });
      } else this.waveSurfer.pause();
    },
    volume: function (value) {
      console.log(value);
      this.waveSurfer.setVolume(value);
    },
  },
};
</script>

<style lang="css" scoped>
div {
  position: relative;
  background: #333333;
}
</style>
