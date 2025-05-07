import { z } from "zod";
import { Element } from "./elements";

export const WsMessageTypeSchema = z.enum(['CREATE', 'UPDATE', 'DELETE', 'UPDATE_BATCH']);

const CreateMsg = z.object({
  type: z.literal("CREATE"),
  id:z.string(),
  payload: Element
})

const UpdateMsg = z.object({
  type: z.literal("UPDATE"),
  id:z.string(),
  payload: Element
})
const UpdateBatchMsg = z.object({
  type: z.literal("UPDATE_BATCH"),
  id:z.string(),
  payload: z.array(Element)
})

const DeleteMsg = z.object({
  type: z.literal("DELETE"),
  id:z.string(),
  payload:Element
})

export const WsMessageSchema = z.discriminatedUnion("type", [
  CreateMsg,
  UpdateMsg,
  DeleteMsg,
  UpdateBatchMsg
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
