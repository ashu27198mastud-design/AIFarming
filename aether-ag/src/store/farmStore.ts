// AETHER AG — Zustand Farm Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FarmTwin, ResolutionCard, StreamCard, IrrigationAction, DroneMission, OutcomeVerification, CountryPack, TimelineEvent } from '@/types';
import { DEMO_FARM_TWIN, DEMO_STREAM_CARDS, DEMO_RESOLUTION_CARDS, DEMO_DRONE_MISSION, DEMO_HARVEST_SCENARIOS, DEMO_COUNTRY_PACKS } from '@/lib/demo-seed';

interface FarmStore {
  // Farm
  farmTwin: FarmTwin;
  streamCards: StreamCard[];
  resolutionCards: Record<string, ResolutionCard>;
  countryPacks: CountryPack[];
  selectedCountry: string;
  isDemoMode: boolean;
  // Irrigation
  irrigationStatus: 'active' | 'paused' | 'idle';
  irrigationMode: 'advisory' | 'approval' | 'automation';
  // Drone
  droneMission: DroneMission;
  droneProgress: number;
  droneStatus: string;
  // Verifications
  verifications: OutcomeVerification[];
  // Actions
  approveResolution: (cardId: string) => void;
  dismissCard: (cardId: string) => void;
  pauseIrrigation: () => void;
  resumeIrrigation: () => void;
  setIrrigationMode: (mode: 'advisory' | 'approval' | 'automation') => void;
  startDroneMission: () => void;
  updateDroneProgress: (progress: number) => void;
  completeDroneMission: () => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  updateFarmTwin: (updates: Partial<FarmTwin>) => void;
  setSelectedCountry: (code: string) => void;
  addVerification: (v: OutcomeVerification) => void;
  updateVerification: (id: string, updates: Partial<OutcomeVerification>) => void;
}

export const useFarmStore = create<FarmStore>()(
  persist(
    (set, get) => ({
      farmTwin: DEMO_FARM_TWIN,
      streamCards: DEMO_STREAM_CARDS,
      resolutionCards: DEMO_RESOLUTION_CARDS,
      countryPacks: DEMO_COUNTRY_PACKS,
      selectedCountry: 'IN',
      isDemoMode: true,
      irrigationStatus: 'active',
      irrigationMode: 'advisory',
      droneMission: DEMO_DRONE_MISSION,
      droneProgress: 0,
      droneStatus: 'idle',
      verifications: [],

      approveResolution: (cardId) => set(state => {
        const card = state.resolutionCards[cardId];
        if (!card) return state;
        const newEvent: TimelineEvent = {
          id: `evt-${Date.now()}`,
          farmId: state.farmTwin.farmId,
          fieldId: card.fieldId,
          timestamp: new Date().toISOString(),
          type: 'resolution',
          title: `Resolution approved: ${card.title}`,
          description: card.recommendation,
          priority: card.priority,
          linkedEntityId: cardId,
          dataSource: 'live',
        };
        return {
          resolutionCards: { ...state.resolutionCards, [cardId]: { ...card, status: 'approved', approvedAt: new Date().toISOString() } },
          streamCards: state.streamCards.map(c => c.resolutionCardId === cardId ? { ...c, dismissed: true } : c),
          farmTwin: { ...state.farmTwin, activityTimeline: [newEvent, ...state.farmTwin.activityTimeline] },
        };
      }),

      dismissCard: (cardId) => set(state => ({
        streamCards: state.streamCards.map(c => c.id === cardId ? { ...c, dismissed: true } : c),
      })),

      pauseIrrigation: () => set({ irrigationStatus: 'paused' }),
      resumeIrrigation: () => set({ irrigationStatus: 'active' }),
      setIrrigationMode: (mode) => set({ irrigationMode: mode }),

      startDroneMission: () => set(state => ({
        droneMission: { ...state.droneMission, status: 'flying', startedAt: new Date().toISOString() },
        droneProgress: 0,
        droneStatus: 'flying',
      })),

      updateDroneProgress: (progress) => set({ droneProgress: progress }),

      completeDroneMission: () => set(state => {
        const event: TimelineEvent = {
          id: `evt-drone-${Date.now()}`,
          farmId: state.farmTwin.farmId,
          fieldId: 'field-north',
          timestamp: new Date().toISOString(),
          type: 'drone_mission',
          title: 'Drone inspection completed',
          description: 'Localised stress zone identified in rows 7–9. Fungal pressure confirmed. Treatment plan generated.',
          dataSource: 'simulated',
        };
        return {
          droneMission: { ...state.droneMission, status: 'completed', completedAt: new Date().toISOString(), coveragePercent: 100 },
          droneProgress: 100,
          droneStatus: 'completed',
          farmTwin: { ...state.farmTwin, activityTimeline: [event, ...state.farmTwin.activityTimeline] },
        };
      }),

      addTimelineEvent: (event) => set(state => ({
        farmTwin: { ...state.farmTwin, activityTimeline: [event, ...state.farmTwin.activityTimeline] },
      })),

      updateFarmTwin: (updates) => set(state => ({
        farmTwin: { ...state.farmTwin, ...updates },
      })),

      setSelectedCountry: (code) => set({ selectedCountry: code }),

      addVerification: (v) => set(state => ({ verifications: [v, ...state.verifications] })),
      updateVerification: (id, updates) => set(state => ({
        verifications: state.verifications.map(v => v.id === id ? { ...v, ...updates } : v),
      })),
    }),
    { name: 'aether-farm-store', skipHydration: true }
  )
);
