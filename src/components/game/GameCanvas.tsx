"use client";

import { useEffect, useRef } from "react";
import { Application, Sprite, Assets } from "pixi.js";
import { findHitItem } from "@/lib/engine/hit-detection";
import type { TargetItem } from "@/lib/engine/types";

interface GameCanvasProps {
  sceneImage: string;
  targetItems: TargetItem[];
  foundIndices: number[];
  onItemFound: (index: number) => void;
}

const GAME_SIZE = 800;

export function GameCanvas({
  sceneImage,
  targetItems,
  foundIndices,
  onItemFound,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const spriteRef = useRef<Sprite | null>(null);
  const onItemFoundRef = useRef(onItemFound);
  onItemFoundRef.current = onItemFound;

  // Store latest values in refs so handleClick stays stable
  const targetItemsRef = useRef(targetItems);
  targetItemsRef.current = targetItems;
  const foundIndicesRef = useRef(foundIndices);
  foundIndicesRef.current = foundIndices;

  const handleClickRef = useRef((x: number, y: number) => {
    const index = findHitItem(
      x, y, GAME_SIZE, GAME_SIZE,
      targetItemsRef.current,
      foundIndicesRef.current
    );
    if (index !== null) {
      onItemFoundRef.current(index);
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    async function initPixi() {
      const app = new Application();
      await app.init({
        width: GAME_SIZE,
        height: GAME_SIZE,
        backgroundAlpha: 0,
        antialias: true,
        resolution: 1,
        autoDensity: true,
      });

      if (destroyed || !containerRef.current) {
        app.destroy(true);
        return;
      }

      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      const texture = await Assets.load(sceneImage);
      if (destroyed) {
        app.destroy(true);
        return;
      }

      const sprite = new Sprite(texture);
      sprite.width = GAME_SIZE;
      sprite.height = GAME_SIZE;
      sprite.eventMode = "static";
      sprite.cursor = "pointer";
      spriteRef.current = sprite;

      sprite.on("pointerdown", (event) => {
        // toLocal returns coords in texture space (0-2048)
        // Normalize to display space (0-GAME_SIZE) for hit detection
        const local = sprite.toLocal(event.global);
        const displayX = (local.x / sprite.texture.width) * GAME_SIZE;
        const displayY = (local.y / sprite.texture.height) * GAME_SIZE;
        handleClickRef.current(displayX, displayY);
      });

      app.stage.addChild(sprite);
    }

    initPixi().catch(console.error);

    return () => {
      destroyed = true;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [sceneImage]);

  // Highlight found items — visual markers added in future iteration
  useEffect(() => {
    // TODO: add visual markers for found items
  }, [foundIndices]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[800px] aspect-square mx-auto rounded-lg overflow-hidden shadow-lg"
    />
  );
}
