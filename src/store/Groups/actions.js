import API from "../../services/api";

const api = new API("groups");

const actions = {};

actions.getGeometry = ({ commit }) => {
  api
    .get()
    .then((response) => commit("setGeometry", response))
    .catch(() => commit("clearGeometry"));
};

actions.updateGeometry = ({ commit }, cod_id) => {
  const url = `/${cod_id}`
  api
    .get(url)
    .then((response) => commit("setGeometry", response))
    .catch();
};

export default actions;
