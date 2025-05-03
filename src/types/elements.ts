import z from 'zod'


const ElementType = z.union([
    z.literal('PERSON'),
    z.literal('LOCATION'),
    z.literal('POINTER'),
    z.literal('NOTE'),
    z.literal('ITEM')
])

export const Position = z.object({
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number()
})

export const Tool = ElementType.or(z.literal('SELECT'))

export const Element = z.object({
    id: z.string(),
    type: ElementType,
    position: Position
})

export type ElementDto = z.infer<typeof Element>
export type ElementPosition = z.infer<typeof Position>
export type ElementType = z.infer<typeof ElementType>
export type Tool = z.infer<typeof Tool>