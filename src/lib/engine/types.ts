export interface TargetItem {
  name: string;
  cropImage: string;
  bboxXMin: number;
  bboxYMin: number;
  bboxXMax: number;
  bboxYMax: number;
  sortOrder: number;
}

export interface LevelData {
  id: number;
  title: string;
  keywords: string;
  tags: string;
  sceneDescription: string;
  difficulty: number;
  sceneImage: string;
  status: "draft" | "approved";
  targetItems: TargetItem[];
  createdAt: string;
}

export type GamePhase = "playing" | "completed";

export interface GameState {
  phase: GamePhase;
  foundItemIndices: number[];
}
