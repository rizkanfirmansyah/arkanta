"use client";

import { mockComponents } from "@/data/components";
import { recommendationTemplates } from "@/data/templates";
import { calculateBuildPrice, calculateScores, estimateBuildWattage } from "@/lib/scoring";
import {
  BuildRecommendationResponse,
  ChangeAnalysis,
  ComponentCategory,
  ComponentItem,
  DiagnosisResult,
  RecommendedBuild,
  RecommendationTemplate,
  UserIntake,
} from "@/types";
import { create } from "zustand";

const defaultIntake: UserIntake = {
  budget: 12000000,
  mainNeeds: ["gaming"],
  software: ["Valorant", "Office", "Chrome"],
  targetResolution: "1080p",
  brandPreference: ["bebas"],
  usageHoursPerDay: 6,
  frequentOutage: false,
  mcbTripsOften: false,
  housePower: "1300VA",
  hasUps: false,
  hotRoom: false,
  silentPreference: false,
  wantsUpgradeIn13Years: true,
  priorities: ["performa", "future-proof"],
};

interface BuilderStore {
  intake: UserIntake;
  diagnosis: DiagnosisResult | null;
  recommendations: BuildRecommendationResponse | null;
  selectedBuildId: string | null;
  editedBuild: RecommendedBuild | null;
  comparisonBuildIds: string[];
  changeAnalysis: ChangeAnalysis | null;
  changeAnalysisLoading: boolean;
  componentDatabase: ComponentItem[];
  templates: RecommendationTemplate[];
  loading: boolean;
  error: string | null;
  updateIntake: <K extends keyof UserIntake>(key: K, value: UserIntake[K]) => void;
  setIntake: (intake: UserIntake) => void;
  setDiagnosis: (diagnosis: DiagnosisResult | null) => void;
  setRecommendations: (response: BuildRecommendationResponse | null) => void;
  selectBuild: (buildId: string) => void;
  setEditedBuild: (build: RecommendedBuild | null) => void;
  applyComponentChange: (category: ComponentCategory, componentId: string) => void;
  setComparisonBuildIds: (buildIds: string[]) => void;
  setChangeAnalysis: (analysis: ChangeAnalysis | null) => void;
  setChangeAnalysisLoading: (loading: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  upsertComponent: (component: ComponentItem) => void;
  saveTemplate: (template: RecommendationTemplate) => void;
  clearGeneratedResults: () => void;
  resetFlow: () => void;
}

export const useBuilderStore = create<BuilderStore>((set) => ({
  intake: defaultIntake,
  diagnosis: null,
  recommendations: null,
  selectedBuildId: null,
  editedBuild: null,
  comparisonBuildIds: [],
  changeAnalysis: null,
  changeAnalysisLoading: false,
  componentDatabase: mockComponents,
  templates: recommendationTemplates,
  loading: false,
  error: null,
  updateIntake: (key, value) => set((state) => ({ intake: { ...state.intake, [key]: value } })),
  setIntake: (intake) => set({ intake }),
  setDiagnosis: (diagnosis) => set({ diagnosis }),
  setRecommendations: (recommendations) =>
    set(() => {
      const builds = Array.isArray(recommendations?.builds) ? recommendations.builds : [];
      return {
        recommendations: builds.length ? recommendations : null,
        selectedBuildId: builds[0]?.id ?? null,
        editedBuild: builds[0] ?? null,
        comparisonBuildIds: builds.map((build) => build.id).slice(0, 3),
      };
    }),
  selectBuild: (buildId) =>
    set((state) => {
      const selected = state.recommendations?.builds.find((build) => build.id === buildId) ?? null;
      return {
        selectedBuildId: buildId,
        editedBuild: selected ? { ...selected } : null,
        changeAnalysis: null,
        changeAnalysisLoading: false,
      };
    }),
  setEditedBuild: (editedBuild) => set({ editedBuild }),
  applyComponentChange: (category, componentId) =>
    set((state) => {
      if (!state.editedBuild) return {};
      const component = state.componentDatabase.find((item) => item.id === componentId);
      if (!component) return {};
      const nextBuild: RecommendedBuild = {
        ...state.editedBuild,
        components: {
          ...state.editedBuild.components,
          [category]: { id: component.id, name: component.name, price: component.price },
        },
      };
      nextBuild.estimatedPrice = calculateBuildPrice(nextBuild);
      nextBuild.estimatedWattage = estimateBuildWattage(nextBuild);
      nextBuild.scores = calculateScores(nextBuild, state.intake, state.diagnosis ?? undefined);
      return { editedBuild: nextBuild, changeAnalysis: null };
    }),
  setComparisonBuildIds: (comparisonBuildIds) => set({ comparisonBuildIds }),
  setChangeAnalysis: (changeAnalysis) => set({ changeAnalysis }),
  setChangeAnalysisLoading: (changeAnalysisLoading) => set({ changeAnalysisLoading }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  upsertComponent: (component) =>
    set((state) => {
      const exists = state.componentDatabase.some((item) => item.id === component.id);
      return {
        componentDatabase: exists
          ? state.componentDatabase.map((item) => (item.id === component.id ? component : item))
          : [...state.componentDatabase, component],
      };
    }),
  saveTemplate: (template) =>
    set((state) => ({
      templates: state.templates.some((item) => item.id === template.id)
        ? state.templates.map((item) => (item.id === template.id ? template : item))
        : [...state.templates, template],
    })),
  clearGeneratedResults: () =>
    set({
      diagnosis: null,
      recommendations: null,
      selectedBuildId: null,
      editedBuild: null,
      comparisonBuildIds: [],
      changeAnalysis: null,
      changeAnalysisLoading: false,
      error: null,
    }),
  resetFlow: () =>
    set({
      diagnosis: null,
      recommendations: null,
      selectedBuildId: null,
      editedBuild: null,
      comparisonBuildIds: [],
      changeAnalysis: null,
      changeAnalysisLoading: false,
      loading: false,
      error: null,
    }),
}));

export function getSelectedBuild(state: BuilderStore) {
  return state.recommendations?.builds.find((build) => build.id === state.selectedBuildId) ?? null;
}
