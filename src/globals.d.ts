import { Entity } from "./lib/ecs/entities/Entity";

declare global {
    interface HTMLElementEventMap {
      // name of your event → its payload type
      'resizeended': CustomEvent<{resizedEntity:Entity}>;
      'moveended': CustomEvent<{resizedEntity:Entity}>;
    }
  }