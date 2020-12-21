import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "http://0.0.0.0:3000"
})

export default class API {
  constructor(resource) {
    this.resource = resource;
  }

  get(path = '') {
    const url = this.resource + path;

    return axiosInstance.get(url).then(response => response.data);
  }

  post(path = '', data = {}) {
    const url = this.resource + path;

    return axiosInstance.post(url, data).then(response => response.data);
  }

  put(id = '', data = {}) {
    const url = `${this.resource}/${id}`;

    return axiosInstance.put(url, data).then(response => response.data);
  }

  delete(id = '') {
    const url = `${this.resource}/${id}`;

    return axiosInstance.delete(url).then(response => response.data);
  }
}
