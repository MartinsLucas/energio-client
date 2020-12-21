import API from "../../services/api";
import _ from "lodash";

const api = new API("groups");

const actions = {};

actions.addLayer = ({ commit }, { groupId, className }) => {
  const url = `/${groupId}/entities?class_name=${className}`;
  api.get(url).then((response) => {
    if (!_.isEmpty(response) && response.features.length) {
      commit("addLayer", { data: response, className: className });
    }
  });
};

actions.removeLayer = ({ commit }, className) =>
  commit("removeLayer", className);

actions.clearLayer = ({ commit }) => commit("clearLayers");

export default actions;
