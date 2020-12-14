export default {
  setGeometry(state, data) {
    state.geometry = data;
  },
  clearGeometry(state) {
    state.geometry = {};
  }
};
