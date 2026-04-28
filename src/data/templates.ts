import { RecommendationTemplate } from "@/types";

export const recommendationTemplates: RecommendationTemplate[] = [
  {
    id: "balanced-safe",
    name: "Balanced Aman Rumah 1300VA",
    description: "Prioritaskan GPU efisien, PSU Gold, dan opsi UPS.",
    strategy: "safety_first",
    tags: ["listrik", "ups", "balanced"],
  },
  {
    id: "amd-value-gaming",
    name: "AMD Value Gaming 1440p",
    description: "Fokus FPS dan value, tetap jaga headroom PSU.",
    strategy: "value_first",
    tags: ["gaming", "1440p", "value"],
  },
  {
    id: "creator-cuda",
    name: "Creator CUDA Aman",
    description: "NVIDIA, storage lebih cepat, RAM lebih besar, dan UPS jika perlu.",
    strategy: "creator_first",
    tags: ["editing", "cuda", "storage"],
  },
  {
    id: "low-power-student",
    name: "Low Power Mahasiswa",
    description: "Build irit listrik dengan jalur upgrade 1-3 tahun.",
    strategy: "low_power",
    tags: ["mahasiswa", "low power", "upgrade"],
  },
];
