<template>
  <div
    style="background: #d3d3d3; padding: 2em 0"
    class="d-flex align-items-center"
  >
    <b-container>
      <draggable
        v-model="model"
        group="people"
        draggable=".item"
        @start="drag = true"
        @end="drag = false"
      >
        <div class="box item" v-for="(element, idx) in model" :key="idx">
          <p>
            {{ element.type }} {{ element.type !== "Flatten" ? ":" : null }}
            {{ renderLeft(element) }}
          </p>
          <div class="d-flex align-items-center">
            <p>{{ renderRight(element) }}</p>
            <b-icon-x-circle-fill
              variant="danger"
              @click="onRemoveLayer(idx)"
            ></b-icon-x-circle-fill>
          </div>
        </div>
        <div slot="header" class="box" role="group" aria-label="Input">
          <p>Input</p>
        </div>
        <b-card no-body class="mb-1" slot="footer">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-button block v-b-toggle.accordion-1 variant="info"
              >Advance parameters</b-button
            >
          </b-card-header>
          <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-form>
                <b-form-group
                  id="input-group-main-1"
                  label="Epochs:"
                  label-for="input-main-1"
                >
                  <b-form-input
                    id="input-main-1"
                    v-model="epochs"
                    type="number"
                    min="0"
                    required
                    placeholder="Enter epochs"
                  ></b-form-input>
                </b-form-group>

                <b-form-group
                  id="input-group-2"
                  label="Learning rate:"
                  label-for="input-2"
                >
                  <b-form-input
                    id="input-2"
                    v-model="learning_rate"
                    required
                    type="number"
                    min="0"
                    step="0.0001"
                    placeholder="Enter learning rate"
                  ></b-form-input>
                </b-form-group>
                <b-form-group
                  id="input-group-main-3"
                  label="Optimizer:"
                  label-for="input-main-3"
                >
                  <b-form-select
                    id="input-main-3"
                    v-model="optimizer"
                    :options="optimizerTypes"
                    required
                  >
                  </b-form-select>
                </b-form-group>
                <b-form-group
                  id="input-group-main-4"
                  label="Batch size:"
                  label-for="input-main-4"
                >
                  <b-form-input
                    id="input-main-4"
                    v-model="batch_size"
                    type="number"
                    min="0"
                    required
                    placeholder="Enter batch size"
                  ></b-form-input>
                </b-form-group>
                <b-form-group
                  id="input-group-main-5"
                  label="Loss:"
                  label-for="input-main-5"
                >
                  <b-form-select
                    id="input-main-5"
                    v-model="loss"
                    :options="lossTypes"
                    required
                  >
                  </b-form-select>
                </b-form-group>
                <b-form-group
                  id="input-group-main-7"
                  label="Monitor:"
                  label-for="input-main-7"
                >
                  <b-form-select
                    id="input-main-7"
                    v-model="monitor"
                    :options="monitorTypes"
                    required
                  >
                  </b-form-select>
                </b-form-group>
                <b-form-group
                  id="input-group-main-8"
                  label="Mode:"
                  label-for="input-main-8"
                >
                  <b-form-select
                    id="input-main-8"
                    v-model="mode"
                    :options="modeTypes"
                    required
                  >
                  </b-form-select>
                </b-form-group>
                <b-form-checkbox
                  id="checkbox-main"
                  v-model="save_best_only"
                  name="checkbox-main"
                  value="true"
                  unchecked-value="false"
                >
                  save best only
                </b-form-checkbox>
              </b-form>
            </b-card-body>
          </b-collapse>
        </b-card>
      </draggable>
      <div class="d-flex justify-content-between">
        <b-button v-b-modal.modal-1>Add new layer</b-button>
        <b-button variant="primary" @click="onSave">Save</b-button>
      </div>
      <b-modal
        id="modal-1"
        title="Add new layer"
        ref="modal"
        @show="resetModal"
        @hidden="resetModal"
        @ok="handleOk"
      >
        <form ref="form" @submit.stop.prevent="handleSubmit">
          <b-form-group id="fieldset-1" label="Layer Type" label-for="input-1">
            <b-form-select
              id="input-1"
              v-model="selectedTypes"
              :options="layerTypes"
              required
            >
            </b-form-select>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'CNN2D'"
            id="fieldset-2"
            label="Filters"
            label-for="input-2"
          >
            <b-form-input
              id="input-2"
              placeholder="Filter"
              v-model="filters"
              type="number"
              min="0"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'MaxPool2D'"
            id="fieldset-2-1"
            label="Pool Size"
            label-for="input-2-1"
          >
            <div class="dis-flex-50">
              <b-form-input
                id="input-2-1"
                placeholder="Pool Size"
                v-model="pool_size_0"
                type="number"
                min="0"
                required
              ></b-form-input>
              <b-form-input
                id="input-2-1"
                placeholder="Pool Size"
                v-model="pool_size_1"
                type="number"
                min="0"
                required
              ></b-form-input>
            </div>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'Dense'"
            id="fieldset-2-2"
            label="Units"
            label-for="input-2-2"
          >
            <b-form-input
              id="input-2-2"
              placeholder="Units"
              v-model="units"
              type="number"
              min="0"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'CNN2D'"
            id="fieldset-3"
            label="Kernel Size"
            label-for="input-3"
          >
            <div class="dis-flex-50">
              <b-form-input
                id="input-3"
                placeholder="Kernel Size X"
                v-model="kernel_size_0"
                type="number"
                required
                min="0"
              ></b-form-input>
              <b-form-input
                id="input-3"
                placeholder="Kernel Size Y"
                v-model="kernel_size_1"
                type="number"
                required
                min="0"
              ></b-form-input>
            </div>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'CNN2D' || selectedTypes === 'MaxPool2D'"
            id="fieldset-4"
            label="Strides"
            label-for="input-4"
          >
            <div class="dis-flex-50">
              <b-form-input
                id="input-4"
                placeholder="Strides X"
                v-model="strides_0"
                type="number"
                min="0"
                required
              ></b-form-input>
              <b-form-input
                id="input-4"
                placeholder="Strides Y"
                v-model="strides_1"
                type="number"
                min="0"
                required
              ></b-form-input>
            </div>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'CNN2D' || selectedTypes === 'MaxPool2D'"
            id="fieldset-5"
            label="Padding"
            label-for="input-5"
          >
            <b-form-select
              id="input-5"
              v-model="selectedPadding"
              :options="paddingTypes"
              required
            >
            </b-form-select>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'CNN2D'"
            id="fieldset-6"
            label="Dilation rate"
            label-for="input-6"
          >
            <div class="dis-flex-50">
              <b-form-input
                id="input-6"
                placeholder="Dilation rate X"
                v-model="dilation_rate_0"
                type="number"
                min="0"
                required
              ></b-form-input>
              <b-form-input
                id="input-6"
                placeholder="Dilation rate Y"
                v-model="dilation_rate_1"
                type="number"
                min="0"
                required
              ></b-form-input>
            </div>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'CNN2D'"
            id="fieldset-7"
            label="Activation"
            label-for="input-7"
          >
            <b-form-select
              id="input-7"
              v-model="selectedActivation"
              :options="activationCNNTypes"
              required
            >
            </b-form-select>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'Dense'"
            id="fieldset-7-1"
            label="Activation"
            label-for="input-7-1"
          >
            <b-form-select
              id="input-7-1"
              v-model="selectedActivation"
              :options="activationDenseTypes"
              required
            >
            </b-form-select>
          </b-form-group>
          <b-form-group
            v-if="selectedTypes === 'Dropout'"
            id="fieldset-8-1"
            label="Remove Probability"
            label-for="input-8-1"
          >
            <b-form-input
              id="input-8-1"
              placeholder="0.5"
              v-model="remove_prob"
              type="number"
              min="0"
              max="1"
              step="0.01"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-checkbox
            v-if="selectedTypes === 'CNN2D' || selectedTypes === 'Dense'"
            id="checkbox-1"
            v-model="use_bias"
            name="checkbox-1"
            value="true"
            unchecked-value="false"
          >
            use bias
          </b-form-checkbox>
        </form>
      </b-modal>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";
import draggable from "vuedraggable";
import { BIconXCircleFill } from "bootstrap-vue";

axios.defaults.timeout = 300000;

// eslint-disable-next-line no-unused-vars
var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`,
});

var initial_model_params = [
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
  name: "CNN",
  components: {
    draggable,
    BIconXCircleFill,
  },
  props: {
    callback: Function,
  },
  created() {},
  data() {
    return {
      selectedTypes: "CNN2D",
      selectedPadding: "same",
      selectedActivation: "linear",
      filters: "",
      kernel_size_0: "",
      kernel_size_1: "",
      strides_0: "",
      strides_1: "",
      dilation_rate_0: "",
      dilation_rate_1: "",
      use_bias: false,
      pool_size_0: "",
      pool_size_1: "",
      remove_prob: "",
      units: "",
      epochs: "10",
      learning_rate: "0.0001",
      optimizer: "Adam",
      batch_size: "32",
      loss: "categorical_crossentropy",
      save_best_only: true,
      monitor: "val_accuracy",
      mode: "max",
      layerTypes: [
        { value: "CNN2D", text: "CNN2D" },
        { value: "MaxPool2D", text: "MaxPool2D" },
        { value: "Flatten", text: "Flatten" },
        { value: "Dropout", text: "Dropout" },
        { value: "Dense", text: "Dense" },
      ],
      paddingTypes: [
        { value: "same", text: "same" },
        { value: "valid", text: "valid" },
      ],
      activationCNNTypes: [
        { value: "linear", text: "linear" },
        { value: "relu", text: "relu" },
        { value: "tanh", text: "tanh" },
      ],
      activationDenseTypes: [
        { value: "linear", text: "linear" },
        { value: "softmax", text: "softmax" },
        { value: "sigmoid", text: "sigmoid" },
        { value: "relu", text: "relu" },
        { value: "tanh", text: "tanh" },
      ],
      optimizerTypes: [
        { value: "rmsprop", text: "RMSprop" },
        { value: "Adam", text: "Adam" },
        { value: "SGD", text: "SGD" },
      ],
      lossTypes: [
        { value: "categorical_crossentropy", text: "categorical_crossentropy" },
        { value: "binary_crossentropy", text: "binary_crossentropy" },
      ],
      monitorTypes: [
        { value: "val_accuracy", text: "val_accuracy" },
        { value: "val_loss", text: "val_loss" },
      ],
      modeTypes: [
        { value: "max", text: "max" },
        { value: "min", text: "min" },
      ],
      model: [],
    };
  },
  methods: {
    renderLeft(element) {
      return element.type === "CNN2D"
        ? `${element.kernel_size.match(/\d/g)[0]} x ${
            element.kernel_size.match(/\d/g)[1]
          } x ${element.filters}`
        : element.type === "MaxPool2D"
        ? `${element.pool_size.match(/\d/g)[0]} x ${
            element.pool_size.match(/\d/g)[1]
          }`
        : element.type === "Dense"
        ? element.units
        : element.type === "Dropout"
        ? element.remove_prob
        : null;
    },
    renderRight(element) {
      return element.type === "CNN2D"
        ? element.activation
        : element.type === "MaxPool2D"
        ? `${element.padding} pad`
        : element.type === "Dense"
        ? element.activation
        : null;
    },
    onRemoveLayer(idx) {
      this.model.splice(idx, 1);
    },
    onAddNewLayer() {
      switch (this.selectedTypes) {
        case "CNN2D":
          this.model = this.model.concat([
            {
              type: this.selectedTypes,
              filters: this.filters,
              kernel_size: `(${this.kernel_size_0},${this.kernel_size_1})`,
              strides: `(${this.strides_0}, ${this.strides_1})`,
              padding: this.selectedPadding,
              dilation_rate: `(${this.dilation_rate_0},${this.dilation_rate_1})`,
              activation: this.selectedActivation,
              use_bias: this.use_bias ? "TRUE" : "FALSE",
            },
          ]);
          break;
        case "MaxPool2D":
          this.model = this.model.concat([
            {
              type: this.selectedTypes,
              pool_size: `(${this.pool_size_0},${this.pool_size_1})`,
              strides: `(${this.strides_0},${this.strides_1})`,
              padding: this.selectedPadding,
            },
          ]);
          break;
        case "Flatten":
          this.model = this.model.concat([
            {
              type: this.selectedTypes,
            },
          ]);
          break;
        case "Dense":
          this.model = this.model.concat([
            {
              type: this.selectedTypes,

              units: this.units,
              activation: this.selectedActivation,
              use_bias: this.use_bias ? "TRUE" : "FALSE",
            },
          ]);
          break;
      }
    },
    onSave() {
      const {
        epochs,
        learning_rate,
        optimizer,
        batch_size,
        loss,
        save_best_only,
        monitor,
        mode,
        model,
      } = this;
      this.callback({
        epochs,
        learning_rate,
        optimizer,
        batch_size,
        loss,
        save_best_only,
        monitor,
        mode,
        model,
      });
    },
    checkFormValidity() {
      const valid = this.$refs.form.checkValidity();
      return valid;
    },
    resetModal() {
      this.selectedTypes = "CNN2D";
      this.selectedPadding = "same";
      this.selectedActivation = "linear";
      this.filters = "";
      this.kernel_size = "";
      this.strides = "";
      this.dilation_rate = "";
      this.use_bias = false;
      this.pool_size = "";
      this.units = "";
      this.remove_prob = "";
    },
    handleOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    handleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return;
      }

      this.onAddNewLayer();

      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide("modal-1");
      });
    },
  },
  directives: {},
  mounted() {
    this.model = initial_model_params;
    this.epochs = "100";
    this.learning_rate = "1e-4";
    this.optimizer = "rmsprop";
    this.batch_size = "32";
    this.loss = "categorical_crossentropy";
    this.save_best_only = "True";
    this.monitor = "val_accuracy";
    this.mode = "max";
  },
  updated() {},
  computed: {
    ...mapGetters([
      "getProjectDir",
      "getProjects",
      "getImages",
      "getProjectStatus",
      "getCmdVel",
    ]),
  },
};
</script>

<style lang="scss" scoped>
.box {
  border: solid 1px black;
  padding: 0.5em 1em;
  background: #fff;
  margin: 0 0 0.5em 0;
  border-radius: calc(0.25rem - 1px);
  display: flex;
  justify-content: space-between;

  p {
    margin: 0;
  }
  svg {
    opacity: 0;
    transition: all ease-in-out 300ms;
    margin-left: 0.5em;
    cursor: pointer !important;
  }
  &:hover {
    svg {
      opacity: 1;
    }
  }
}

.item {
  cursor: move;
}

.dis-flex-50 {
  display: flex;
  input {
    width: 50%;
  }
}
</style>
