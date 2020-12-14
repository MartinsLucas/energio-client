<template>
  <div ref="map-root" style="width: 100%; height: 100%"></div>
</template>

<script>
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import { mapActions, mapGetters } from "vuex";
import State from "../services/states.js";

import "ol/ol.css";

export default {
  name: "MapContainer",
  components: {},
  data: () => ({
    mainMap: null,
    vectorLayer: null,
    autoUpdate: 0,
  }),

  mounted() {
    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
      }),
    });

    this.mainMap = new Map({
      target: this.$refs["map-root"],
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.vectorLayer,
      ],

      view: new View({
        zoom: 0,
        center: [0, 0],
        constrainResolution: true,
      }),
    });

    this.mainMap.on("click", (event) => {
      // will return the first feature under the pointer
      const clicked = this.mainMap.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );
      // emit a `select` event, either with a feature or without
      this.selectElement(clicked);
    });

    this.updateLayers(this.geometry);
  },
  watch: {
    geometry(value) {
      this.updateLayers(value);
    },
  },
  created() {
    this.getGeometry();
  },
  computed: {
    ...mapGetters({
      geometry: "groups/geometry",
    }),
  },
  methods: {
    ...mapActions({
      getGeometry: "groups/getGeometry",
      updateGeometry: "groups/updateGeometry",
    }),
    updateLayers(geojson) {
      if (geojson) {
        console.log("############# watch #############");
        console.log(geojson);
        console.log("############# watch #############");
        const view = this.mainMap.getView();
        const source = this.vectorLayer.getSource();

        const features = new GeoJSON({
          featureProjection: "EPSG:3857",
        }).readFeatures(geojson);

        source.clear();
        source.addFeatures(features);

        // this zooms the view on the created object
        view.fit(source.getExtent());
      }
    },
    selectElement(clicked) {
      // const source = clicked.getSource();
      // view.fit(source.getExtent());
      if (clicked) {
        console.log(clicked.getId());
        this.updateGeometry(clicked.getId());
      }
    },
    // autoupdateGeometry() {
    //   this.getGeometry().then(() => {
    //     this.autoUpdate = setTimeout(this.autoupdateGeometry, 5000);
    //   });
    // },
  },
};
</script>
