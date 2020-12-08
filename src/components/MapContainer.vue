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

import "ol/ol.css";

export default {
  name: "MapContainer",
  components: {},
  data: () => ({
    olMap: null,
    vectorLayer: null,
    autoUpdate: 0,
  }),

  mounted() {
    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
      }),
    });

    this.olMap = new Map({
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

    this.updateLayers(this.geojson);
  },
  watch: {
    geometry(value) {
      this.updateLayers(value);
    },
  },
  created() {
    this.autoUpdate = setTimeout(this.autoupdateGeometry, 5000);
  },
  computed: {
    ...mapGetters({
      geometry: "groups/geometry",
    }),
  },
  methods: {
    updateLayers(geojson) {
      const view = this.olMap.getView();
      const source = this.vectorLayer.getSource();

      const features = new GeoJSON({
        featureProjection: "EPSG:3857",
      }).readFeatures(geojson);

      source.clear();
      source.addFeatures(features);

      // this zooms the view on the created object
      view.fit(source.getExtent());
    },
    ...mapActions({
      getGeometry: "groups/getGeometry",
    }),
    autoupdateGeometry() {
      this.getGeometry().then(() => {
        this.autoUpdate = setTimeout(this.autoupdateGeometry, 5000);
      });
    },
  },
};
</script>
