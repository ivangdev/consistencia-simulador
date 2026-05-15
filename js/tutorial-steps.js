export const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Bienvenida",
    subtitle: "Tutorial de Consistencia Distribuida",
    targetSelector: null,
    spotlightTarget: null,
    htmlFile: ".stitch/designs/tutorial-step-1-welcome.html",
    actions: {
      primary: { label: "Comenzar Tutorial", action: "next" },
      secondary: { label: "Saltar Tutorial", action: "skip" }
    }
  },
  {
    id: 2,
    title: "Las Tres Réplicas",
    subtitle: "Paso 1 de 5",
    targetSelector: ".replica-card",
    spotlightTarget: ".replica-card",
    htmlFile: ".stitch/designs/tutorial-step-2-replicas.html",
    actions: {
      primary: { label: "Siguiente", action: "next" },
      secondary: { label: "Saltar", action: "skip" }
    }
  },
  {
    id: 3,
    title: "Modelos de Consistencia",
    subtitle: "Paso 2 de 5",
    targetSelector: "#model-selector",
    spotlightTarget: "#model-selector",
    htmlFile: ".stitch/designs/tutorial-step-3-models.html",
    actions: {
      primary: { label: "Confirmar", action: "selectModel" },
      secondary: { label: "Saltar", action: "skip" }
    }
  },
  {
    id: 4,
    title: "Conflictos y Resoluciones",
    subtitle: "Paso 3 de 5",
    targetSelector: ".replica-card[data-replica='A']",
    spotlightTarget: ".replica-card[data-replica='A'], .replica-card[data-replica='B']",
    htmlFile: ".stitch/designs/tutorial-step-4-conflictos.html",
    actions: {
      primary: { label: "Resolver Conflicto", action: "resolveConflict" },
      secondary: { label: "Saltar", action: "skip" }
    }
  },
  {
    id: 5,
    title: "Simulación y Observación",
    subtitle: "Paso 4 de 5",
    targetSelector: ".play-btn",
    spotlightTarget: ".play-btn",
    htmlFile: ".stitch/designs/tutorial-step-5-simulacion.html",
    actions: {
      primary: { label: "Iniciar Simulación", action: "startSimulation" },
      secondary: { label: "Saltar", action: "skip" }
    }
  },
  {
    id: 6,
    title: "Operación de Escritura",
    subtitle: "Paso 5 de 5",
    targetSelector: ".write-input",
    spotlightTarget: ".write-input",
    htmlFile: ".stitch/designs/tutorial-step-6-write.html",
    actions: {
      primary: { label: "Ejecutar Write", action: "executeWrite" },
      secondary: { label: "Saltar", action: "skip" }
    }
  },
  {
    id: 7,
    title: "Paso Final",
    subtitle: "Completado",
    targetSelector: null,
    spotlightTarget: null,
    htmlFile: ".stitch/designs/tutorial-step-7-final.html",
    actions: {
      primary: { label: "Finalizar", action: "finish" },
      secondary: null
    }
  }
];

export const TUTORIAL_CONFIG = {
  storageKey: "consistency-simulator-tutorial",
  spotlightColor: "rgba(99, 102, 241, 0.15)",
  spotlightBorder: "2px solid rgba(99, 102, 241, 0.6)",
  spotlightTransition: "all 0.3s ease-in-out",
  modalZIndex: 1000,
  spotlightZIndex: 999
};