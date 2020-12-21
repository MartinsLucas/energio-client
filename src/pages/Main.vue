<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>

<template>
  <q-page padding>
    <div id="app">
      <map-container />
    </div>
  </q-page>
</template>

<script>
import MapContainer from "../components/MapContainer.vue";

export default {
  name: "Main",
  components: {
    "map-container": MapContainer,
  },
};
</script>
