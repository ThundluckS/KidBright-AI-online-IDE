import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'

Vue.use(Vuex)

var axiosInstance = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`,
})

export default new Vuex.Store({
  state: {
    projectDir: 'None', // The TV inventory
    projects: [],
    images: [],
    imagesClasses: [],
    audios: [],
    audiosClasses: [],
    isProjectOpen: false,
    sCmdVel: null,
    trainingType: 'None',
    blockly_woakspace: null,
    blockly_xml: '',
    usb_path: '',
    rbServer: undefined,
    realtimeSound: [],
    device: 'robot',
    inference: '',
    // projDescription: null
    projDescription: {
      Delay: 1000,
      Duration: 3
    }
  },

  getters: {
    // Here we will create a getter
    getProjectDir: (state) => state.projectDir,
    getProjects: (state) => state.projects,
    getImages: (state) => state.images,
    getImagesClasses: (state) => state.imagesClasses,
    getAudios: (state) => state.audios,
    getAudiosClasses: (state) => state.audiosClasses,
    getProjectStatus: (state) => state.isProjectOpen,
    getCmdVel: (state) => state.sCmdVel,
    getTrainingType: (state) => state.trainingType,
    getBlocklyWorkspace: (state) => state.blockly_woakspace,
    getBlocklyXml: (state) => state.blockly_xml,
    getUsbPath: (state) => state.usb_path,
    getRbServer: (state) => state.rbServer,
    getActiveDevice: (state) => state.device,
    getRealtimeSound: (state) => state.realtimeSound,
    getInference: (state) => state.inference,
    getProjDescription: (state) => state.projDescription,
  },

  mutations: {
    
    ['RESET_IMAGE']: state => state.images = [],

    setProjectDir(state, proDir) {
      state.projectDir = proDir
    },
    addProjects(state, projects) {
      state.projects = projects
    },
    addImages(state, images) {
      state.images = images
    },
    setImagesClasses(state, classes) {
      state.imagesClasses = classes
    },
    addAudios(state, audios) {
      state.audios = audios
    },
    setAudiosClasses(state, classes) {
      state.audiosClasses = classes
    },
    setCmdVel(state, cmd) {
      state.sCmdVel = cmd
    },
    setTrainingType(state, type) {
      state.trainingType = type
    },
    setBlocklyWorkspace(state, blockly_woakspace) {
      state.blockly_woakspace = blockly_woakspace
      console.log(state)
    },
    setBlocklyXml(state, blockly_xml) {
      state.blockly_xml = blockly_xml
    },
    setUsbPath(state, path) {
      state.usb_path = path
    },
    setRbServer(state, rbServer) {
      state.rbServer = rbServer
    },
    setActiveDevice(state, device) {
      state.device = device
    },
    setRealtimeSound(state, rosMessage) {
      state.realtimeSound = rosMessage
    },
    setInference(state, rosMessage) {
      state.inference = rosMessage
    },
    setProjDescription(state, description) {
      state.projDescription = description
    },
  },

  actions: {
    // Here we will create Larry
    setProjectDir({ commit, dispatch }, { name, type, duration, delay }) {
      axiosInstance
        .post('createProject', {
          name,
          type,
          duration,
          delay
        })
        .then((response) => {
          console.log(response.data)
          if (response.data.status === 'OK') {
            commit('setProjectDir', name)
            dispatch('reqProjects')
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    changeProjectDir({ commit }, proDir) {
      commit('setProjectDir', proDir)
    },
    uploadImage({ state, dispatch }, imgData) {
      axiosInstance
        .post('/upload/image', {
          path: state.projectDir,
          base64image: imgData,
        })
        .then((response) => {
          console.log(response.data)
          if (response.data.status === 'OK') {

            //this.$refs['saveAnotation'].show()
            dispatch('reqImages')
            //return true;
          }
        })
        .catch((error) => {
          console.log(error)
          //return false;
        })
    },
    reqProjects({ state, commit }, type) {
      axiosInstance
        .get(`/getProjects/${type}`)
        .then((response) => {
          if (response.data.status === 'OK') {
            commit('addProjects', response.data.projects)
            state.isProjectOpen = true
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    reqImages({ state, commit }, xmlAnnotate = false) {
      let uri = `/img/${state.projectDir}?xmlAnnotate=${xmlAnnotate}`
      axiosInstance
        .get(uri)
        .then((response) => {
          var info = response.data.files
          var index, len
          var allImgs = []
          for (index = 0, len = info.length; index < len; ++index) {
            var imPath = `${state.projectDir}/images/${info[index].file}`
            if (xmlAnnotate) {
              allImgs.unshift({
                fileName: info[index].file,
                file: imPath,
                id: info[index].id,
                isAnnotated: info[index].isAnnotated,
                count: info[index].count,
              })
            } else {
              allImgs.unshift({
                fileName: info[index].file,
                file: imPath,
                id: info[index].id,
                isAnnotated: info[index].isAnnotated,
                class: info[index].class,
              })
            }
          }
          commit('addImages', allImgs)
        })
    },
    reqImagesClasses({ state, commit }) {
      let uri = `/img/${state.projectDir}/class`
      axiosInstance.get(uri).then((response) => {
        if (!response.data.status) commit('setImagesClasses', response.data)
      })
    },
    reqAudios({ state, commit }) {
      let uri = `/wav/${state.projectDir}`
      axiosInstance.get(uri).then((response) => {
        var info = response.data.files
        var index, len
        var allFiles = []
        for (index = 0, len = info.length; index < len; ++index) {
          var projectPath = response.data.projectDir + response.data.folder
          var wav = projectPath + '/wav/' + info[index].file
          var mfcc = projectPath + '/mfcc/image/' + info[index].file.split('.')[0] + '.jpg'
          allFiles.push({
            fileName: info[index].file,
            wav,
            mfcc,
            id: info[index].id,
            isAnnotated: info[index].isAnnotated,
            class: info[index].class,
          })
        }
        commit('addAudios', allFiles)
        commit('setProjDescription', response.data.projDescription)
      })
    },
    reqAudiosClasses({ state, commit }) {
      let uri = `/wav/${state.projectDir}/class`
      axiosInstance.get(uri).then((response) => {
        if (!response.data.status) commit('setAudiosClasses', response.data)
      })
    },
    setAudiosClasses({ commit }, classes) {
      commit('setAudiosClasses', classes)
    },
    setImagesClasses({ commit }, classes) {
      commit('setImagesClasses', classes)
    },
    setCmdVel({ state }, cmd) {
      state.sCmdVel = cmd
    },
    deleteProject({ state, commit }, sel_projectDir) {
      let uri = `/project/${sel_projectDir}`
      axiosInstance
        .delete(uri)
        .then((response) => {
          this.dispatch("reqProjects")
          if (sel_projectDir === state.projectDir) {
            commit('setProjectDir', 'null')
          }
        })
    },

    setTrainingType(context, type) {
      context.commit('setTrainingType', type)
    },
    setBlocklyXml({ commit }, blockly_xml) {
      commit('setBlocklyXml', blockly_xml)
    },
    clearBlocklyWorkspace({ state, commit }) {
      state.blockly_woakspace.clear()
      // commit('RESET_IMAGE')
      console.log('WorkSpace Cleared')
    },
    toggleActiveDevice({ state, commit }) {
      if (state.device === 'robot') {
        commit('setActiveDevice', 'computer')
      } else {
        commit('setActiveDevice', 'robot')
      }

    },
    setRealtimeSound({ commit }, rosMessage) {
      commit('setRealtimeSound', rosMessage)
    },
    setInference({ commit }, rosMessage) {
      commit('setInference', rosMessage)
    },
  },
})
