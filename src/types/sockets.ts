import { z } from "zod";
import { Element } from "./elements";

export const WsMessageTypeSchema = z.enum(['CREATE', 'UPDATE', 'DELETE']);

const CreateMsg = z.object({
  type: z.literal("CREATE"),
  payload: Element
})

const UpdateMsg = z.object({
  type: z.literal("UPDATE"),
})

const DeleteMsg = z.object({
  type: z.literal("DELETE"),
})

export const WsMessageSchema = z.discriminatedUnion("type", [
  CreateMsg,
  UpdateMsg,
  DeleteMsg,
])

export const RawWsMessageSchema = z.preprocess((raw) => {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
  return raw
}, WsMessageSchema)




export type WsMessageType = z.infer<typeof WsMessageTypeSchema>;
export type WsMessage = z.infer<typeof WsMessageSchema>;
