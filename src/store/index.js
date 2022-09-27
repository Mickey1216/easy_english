import { createStore } from 'vuex'

const moduleWords = {
  state: {
    pageSize: -1
  },
  mutations: {
    updatePageSize(state, size){
      state.pageSize = size
    }
  },
}

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    moduleWords
  }
})
