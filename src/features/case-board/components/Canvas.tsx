"use client";

import { useEffect, useRef, useState } from "react";
import { Engine } from "../ecs";
import { InputSystem } from "../ecs/systems/inputSystem";
import { CreationSystem } from "../ecs/systems/creationManager";
import { useCaseStore } from "@/providers/CaseStoreProvider";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {elements} = useCaseStore((state) => state)
  const [state] = useState([{ x: 0, y: 0 }]); // dummy state for tests
  console.log(elements)
  // useEffect(() => {
  //   const newState = { x: Math.random() * 1200, y: Math.random() * 1200 };
  //   const interval = setInterval(
  //     () => setState((prev) => [...prev.concat(newState)]),
  //     1000
  //   );

  //   return () => clearInterval(interval);
  // }, [state]);

  // useEffect(() => {
  //   if (state.length < 3) return;
  //   const interval = setInterval(
  //     () =>
  //       setState((prev) => [
  //         ...prev.splice(Math.floor(Math.random() * prev.length), 1),
  //       ]),
  //     1000
  //   );

  //   return () => clearInterval(interval);
  // }, [state]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new Engine(canvasRef.current, state);
    engine.addSystem("InputSystem", new InputSystem(engine));
    // engine.addSystem("CreationSystem", new CreationSystem(engine));

    engine.init();

    return () => {
      engine.cleanup();
    };
  }, [state]);

  return <canvas ref={canvasRef} className="flex-1 bg-background-700" />;
};
