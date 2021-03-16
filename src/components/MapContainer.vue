<template>
  <div ref="map-root" style="width: 100%; height: 100%">
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content">
        <div v-if="hoveredFeature">
          <div
            v-for="(value, key, index) in getAttributes(hoveredFeature)"
            :key="index"
            class="text-caption text-grey"
          >
            {{ capitalize(key) }}: {{ value }}
          </div>
        </div>
      </div>
    </div>
    <div class="energio-info-cards-container column">
      <div class="q-pa-md col-2 row">
        <q-card class="energio-info-card" flat bordered>
          <q-card-section horizontal>
            <q-card-section class="q-pt-xs">
              <div class="text-overline">Energio</div>
              <div class="text-h6 q-mt-sm q-mb-xs">Group</div>
              <div v-if="selectedGroup">
                <div
                  v-for="(value, key, index) in getGroupAttributes()"
                  :key="index"
                  class="text-caption text-grey"
                >
                  {{ capitalize(key) }}: {{ value }}
                </div>
              </div>
              <div v-else class="text-caption text-grey">
                Click on a group to start
              </div>
            </q-card-section>
          </q-card-section>

          <!-- <q-separator />

          <q-card-actions>
            <q-btn flat round icon="event" />
            <q-btn flat> 7:30PM </q-btn>
            <q-btn flat color="primary"> Reserve </q-btn>
          </q-card-actions> -->
        </q-card>
      </div>
      <div v-if="selectedGroup" class="q-pa-md col-2 row">
        <q-card class="energio-info-card" flat bordered>
          <q-card-section horizontal>
            <q-card-section class="q-pt-xs">
              <div class="text-overline">Energio</div>
              <div class="text-h6 q-mt-sm q-mb-xs">Layers</div>
              <div>
                <div
                  v-for="(layer, index) in validLayers"
                  :key="index"
                  class="text-caption text-grey"
                >
                  <q-btn
                    flat
                    color="primary"
                    @click="toggleLayer(layer)"
                    :label="layer.name"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card-section>

          <!-- <q-separator />

          <q-card-actions>
            <q-btn flat round icon="event" />
            <q-btn flat> 7:30PM </q-btn>
            <q-btn flat color="primary"> Reserve </q-btn>
          </q-card-actions> -->
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import * as Extent from "ol/extent";
import OSM from "ol/source/OSM";
import Overlay from "ol/Overlay";
import TileLayer from "ol/layer/Tile";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import State from "../services/states.js";
import VectorSource from "ol/source/Vector";

import { toStringHDMS } from "ol/coordinate";
import { fromLonLat, toLonLat } from "ol/proj";
import { mapActions, mapGetters } from "vuex";
import { GROUP_RELATED_LAYERS } from "../services/constants.js";

export default {
  name: "MapContainer",

  components: {},

  data: () => ({
    mainMap: null,
    groupsLayer: null,
    selectedGroup: null,
    hoveredFeature: null,
    validLayers: GROUP_RELATED_LAYERS,
    userSelectedLayers: [],
  }),

  mounted() {
    const container = document.getElementById("popup");
    const content = document.getElementById("popup-content");
    const closer = document.getElementById("popup-closer");

    let overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    this.groupsLayer = this.createNewLayer("Groups");

    this.mainMap = new Map({
      target: this.$refs["map-root"],
      overlays: [overlay],
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

    this.mainMap.on("pointermove", (event) => {
      const clicked = this.mainMap.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );

      this.hoveredFeature = clicked ? clicked : null;

      let coordinates = clicked
        ? Extent.getCenter(clicked.getGeometry().getExtent())
        : undefined;

      let center = coordinates ? Extent.getCenter(coordinates) : coordinates;

      overlay.setPosition(coordinates);
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
        // this.loadGroupRelatedLayers(groupId);
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
      this.validLayers.map((layerDescription) => {
        this.addLayer({
          groupId: groupId,
          className: layerDescription.className,
        });
      });
    },

    toggleLayer(layer) {
      const index = this.userSelectedLayers.findIndex((current_layer) => {
        return current_layer.className === layer.className;
      });

      if (index >= 0) {
        let newList = [...this.userSelectedLayers];
        newList.splice(index, 1);
        this.userSelectedLayers = newList;
        this.removeLayer(layer.className);
      } else {
        this.userSelectedLayers = [...this.userSelectedLayers, layer];
        this.addLayer({
          groupId: this.selectedGroup.getId(),
          className: layer.className,
        });
        console.log();
      }
    },

    resetLayers() {
      this.clearLayers();
      this.mainMap
        .getLayers()
        .getArray()
        .filter((layer) => !["Groups", "MainMap"].includes(layer.get("name")))
        .map((layer) => this.mainMap.removeLayer(layer));
    },

    getGroupAttributes() {
      let object = {};
      if (this.selectedGroup) {
        const { geometry, ...attributes } = JSON.parse(
          JSON.stringify(this.selectedGroup)
        ).values_;

        object = attributes;
      }

      return object;
    },

    getAttributes(feature) {
      let object = {};
      if (feature) {
        const { geometry, ...attributes } = JSON.parse(
          JSON.stringify(feature)
        ).values_;

        object = attributes;
      }

      return object;
    },

    capitalize([firstLetter, ...restOfWord]) {
      return firstLetter.toUpperCase() + restOfWord.join("");
    },
  },
};
</script>
