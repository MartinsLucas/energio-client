import Vue from "vue";
import axios from "axios";

const { ENERGIO_API_URL } = process.env;

Vue.prototype.$axios = axios.create({
  baseURL: ENERGIO_API_URL,
});
