import API from '../../services/api';

const api = new API('groups');

const actions = {};

actions.getGeometry = ({ commit }) => {
  api.get().then(response => commit('setGeometry', response));
}

export default actions;
