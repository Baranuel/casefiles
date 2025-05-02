import z from 'zod'

const ElementTypeDto = z.union([
    z.literal('PERSON'),
    z.literal('LOCATION')
])

export const Position = z.object({
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number()
})



export const Element = z.object({
    id: z.string(),
    type: ElementTypeDto,
    position: Position
})

export type ElementDto = z.infer<typeof Element>
export type ElementPosition = z.infer<typeof Position>
