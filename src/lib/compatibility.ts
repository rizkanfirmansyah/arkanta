import { ComponentItem, RecommendedBuild } from "@/types";

export function getComponentMap(components: ComponentItem[]) {
  return new Map(components.map((component) => [component.id, component]));
}

export function validateBuildCompatibility(build: RecommendedBuild, components: ComponentItem[]) {
  const map = getComponentMap(components);
  const warnings: string[] = [];
  const cpu = map.get(build.components.cpu.id);
  const motherboard = map.get(build.components.motherboard.id);
  const ram = map.get(build.components.ram.id);
  const cooler = map.get(build.components.cooler.id);
  const psu = map.get(build.components.psu.id);
  const gpu = map.get(build.components.gpu.id);

  if (cpu && motherboard) {
    const matchesSocket = motherboard.compatibility.socket?.includes(cpu.specs.socket ?? "");
    if (!matchesSocket) warnings.push("Socket CPU dan motherboard tidak cocok.");
  }

  if (motherboard && ram) {
    const matchesRam = motherboard.compatibility.memoryType?.includes(ram.specs.memoryType ?? "");
    if (!matchesRam) warnings.push("Tipe RAM tidak sesuai dengan motherboard.");
  }

  if (cooler && cpu) {
    const supported = cooler.compatibility.socket?.includes(cpu.specs.socket ?? "");
    if (!supported) warnings.push("Cooler belum tentu mendukung socket CPU.");
  }

  if (psu && gpu && psu.compatibility.recommendedGpuTdp && gpu.wattage) {
    if (gpu.wattage > psu.compatibility.recommendedGpuTdp) {
      warnings.push("GPU terlalu berat untuk rekomendasi TDP PSU saat ini.");
    }
  }

  return warnings;
}
