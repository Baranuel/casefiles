/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef } from "react";
import { useCaseContext } from "@/providers/CaseStateProvider";
import { Engine } from "@/lib/ecs";
import { InputSystem } from "@/lib/ecs/systems/inputSystem";
import { CreationSystem } from "@/lib/ecs/systems/creationSystem";
import { RenderingSystem } from "@/lib/ecs/systems/renderingSystem";
import { EventSystem } from "@/lib/ecs/systems/eventSystem";
import { CameraSystem } from "@/lib/ecs/systems/cameraSystem";
import { SelectionSystem } from "@/lib/ecs/systems/selectionSystem";
import { MovingSystem } from "@/lib/ecs/systems/movingSystem";

export const Canvas = () => {
  const state = useCaseContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, state);
    engineRef.current = engine;

    engine.addSystem("EventSystem", new EventSystem(engine));
    engine.addSystem("InputSystem", new InputSystem(engine));
    engine.addSystem("CreationSystem", new CreationSystem(engine));
    engine.addSystem("RenderingSystem", new RenderingSystem(engine));
    engine.addSystem("CameraSystem", new CameraSystem(engine));
    engine.addSystem("SelectionSystem", new SelectionSystem(engine));
    engine.addSystem('MovingSystem', new MovingSystem(engine))

    engine.init();

    return () => {
      engine.cleanup();
    };
    // We don't want to re-initialize the entire engine on every state change.
    // We can mutate the state directly as we're running update and draw every frame
    // Therefore we don't re-render to update our canvas again
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.updateEngineState(state);
  }, [state]); // on every state change we update the engine state to sync with the database and rest of the react app

  return <canvas ref={canvasRef} className="flex-1 bg-background-700" />;
};
