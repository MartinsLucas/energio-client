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
import { GROUP_RELATED_LAYERS } from "../services/constants.js";
import "ol/ol.css";

export default {
  name: "MapContainer",

  components: {},

  data: () => ({
    mainMap: null,
    groupsLayer: null,
    selectedGroup: null,
  }),

  mounted() {
    this.groupsLayer = this.createNewLayer("Groups");

    this.mainMap = new Map({
      target: this.$refs["map-root"],
      layers: [
        new TileLayer({
          name: "MainMap",
          source: new OSM(),
        }),
        this.groupsLayer,
      ],

      view: new View({
        zoom: 0,
        center: [0, 0],
        constrainResolution: true,
      }),
    });

    this.mainMap.on("click", (event) => {
      const clicked = this.mainMap.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );
      this.selectedGroup = clicked;
    });
  },

  watch: {
    groupsGeometry(value) {
      this.updateGroupsLayers(value);
    },

    selectedGroup(value) {
      if (value) {
        const groupId = value.getId();
        this.updateGroupsGeometry(groupId);
        this.loadGroupRelatedLayers(groupId);
      } else {
        this.getGroupsGeometry();
        this.resetLayers();
      }
    },

    activeLayersData(value) {
      this.updateActiveLayers(value);
    },
  },

  created() {
    this.getGroupsGeometry();
  },

  computed: {
    ...mapGetters({
      groupsGeometry: "groups/geometry",
      activeLayersData: "layers/active",
    }),
  },

  methods: {
    ...mapActions({
      getGroupsGeometry: "groups/getGeometry",
      updateGroupsGeometry: "groups/updateGeometry",
      addLayer: "layers/addLayer",
      removeLayer: "layers/removeLayer",
      clearLayers: "layers/clearLayer",
    }),

    createNewLayer(layerName = "") {
      return new VectorLayer({
        name: layerName,
        source: new VectorSource({
          features: [],
        }),
      });
    },

    updateLayer(layer, geojson, isGroup = false) {
      if (geojson && geojson.type) {
        const view = this.mainMap.getView();
        const source = layer.getSource();

        const features = new GeoJSON({
          featureProjection: "EPSG:3857",
        }).readFeatures(geojson);

        isGroup && source.clear();
        source.addFeatures(features);
        isGroup && view.fit(source.getExtent());
      }
    },

    updateGroupsLayers(geojson) {
      this.groupsLayer.getSource().clear();
      this.updateLayer(this.groupsLayer, geojson, true);
    },

    updateActiveLayers(updatedLayersData) {
      updatedLayersData &&
        updatedLayersData.map((layerData) => {
          const newLayer = this.createNewLayer(layerData.data.className);
          this.updateLayer(newLayer, layerData.data);
          this.mainMap.addLayer(newLayer);
        });
    },

    loadGroupRelatedLayers(groupId) {
      GROUP_RELATED_LAYERS.map((layerDescription) => {
        this.addLayer({
          groupId: groupId,
          className: layerDescription.className,
        });
      });
    },

    resetLayers() {
      this.clearLayers();
      this.mainMap
        .getLayers()
        .getArray()
        .filter((layer) => !["Groups", "MainMap"].includes(layer.get("name")))
        .map((layer) => this.mainMap.removeLayer(layer));
    },
  },
};
</script>
