export const LAYERS = {
  LOW_VOLTAGE_CONSUMPTION_UNITS: {
    name: "Low Voltage Consumption Unit",
    className: "LowVoltageConsumptionUnit",
  },
  LOW_VOLTAGE_SEGMENTS: {
    name: "Low Voltage Segments",
    className: "LowVoltageSegment",
  },
  NOTABLE_POINTS: {
    name: "Notable Points",
    className: "NotablePoint",
  },
  MEDIUM_VOLTAGE_SEGMENTS: {
    name: "Medium Voltage Segments",
    className: "MediumVoltageSegment",
  },
  SUBSTATIONS: {
    name: "Substations",
    className: "Substation",
  },
  SUBSTATION_TRANSFORMER_UNITS: {
    name: "Substation Transformer Units",
    className: "SubstationTransformerUnit",
  },
};

export const GROUP_RELATED_LAYERS = [
  LAYERS.LOW_VOLTAGE_SEGMENTS,
  LAYERS.NOTABLE_POINTS,
  LAYERS.MEDIUM_VOLTAGE_SEGMENTS,
];