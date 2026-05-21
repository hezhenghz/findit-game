"use client";

import { useEffect, useRef, useCallback } from "react";
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

  const handleClick = useCallback(
    (x: number, y: number) => {
      const index = findHitItem(x, y, GAME_SIZE, GAME_SIZE, targetItems, foundIndices);
      if (index !== null) {
        onItemFoundRef.current(index);
      }
    },
    [targetItems, foundIndices]
  );

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
      });

      if (destroyed || !containerRef.current) {
        app.destroy(true);
        return;
      }

      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      // Load scene texture
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
        // event.getLocalPosition gives coordinates relative to the sprite
        const pos = event.getLocalPosition(sprite);
        handleClick(pos.x, pos.y);
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
  }, [sceneImage, handleClick]);

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
