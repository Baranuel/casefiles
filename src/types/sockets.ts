import { z } from "zod";

export const WsMessageTypeSchema = z.enum(['CREATE', 'UPDATE', 'DELETE']);

const CreateMsg = z.object({
  type: z.literal("CREATE"),
  id: z.string(),
  payload: z.object({
    position: z.object({
      x: z.number(),
      y: z.number()
    })
  })
})

const UpdateMsg = z.object({
  type: z.literal("UPDATE"),
  id: z.string(),
})

const DeleteMsg = z.object({
  type: z.literal("DELETE"),
  id: z.string(),
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


export const HandlerParamsSchema = z.object({
  createElementMessage: CreateMsg.pick({ id: true, payload: true })
});


export type WsMessageType = z.infer<typeof WsMessageTypeSchema>;
export type WsMessage = z.infer<typeof WsMessageSchema>;

export type HandlerParams = z.infer<typeof HandlerParamsSchema>;
export type SocketHandler = {
  [K in keyof HandlerParams]: (
    params: HandlerParams[K]
  ) => WsMessage;
};

