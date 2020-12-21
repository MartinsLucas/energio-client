export default {
  addLayer(state, { data, className }) {
    state.active = [...state.active, { data: data, className: className }];
  },
  removeLayer(state, className) {
    state.active = [...state.active].filter(
      (value) => value.className !== className
    );
  },
  clearLayers(state) {
    state.active = [];
  },
};
