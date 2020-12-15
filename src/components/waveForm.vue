<template>
  <div id="waveform-container">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
const scaleY = (amplitude, height) => {
  const range = 1024 * 8;
  const offset = 1024 * 4;
  return height - ((amplitude + offset) * height) / range;
};

export default {
  props: ["data"],
  watch: {
    data: function (value) {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      canvas.style.width = "100%";
      canvas.style.height = "100%";

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();

      // Loop forwards, drawing the upper half of the waveform
      for (let x = 0; x < this.data.length; x++) {
        const val = this.data[x];
        const y = scaleY(val, canvas.height);
        ctx.lineTo(x + 3, y + 3);
      }
      ctx.closePath();
      ctx.fillStyle = "white";
      ctx.fill();
    },
  },
};
</script>

<style lang="css" scoped>
#waveform-container {
  position: relative;
  background: #333333;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
