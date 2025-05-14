import { z } from "zod";

export const ContentDto = z.object({
    id: z.string().nullable(),
    element_id: z.string().optional(),
    name: z.string().nullable(),
    text: z.string().nullable(),
})


export type UpdateContentDto = {
    element_id: string;
    value: Content
}
export type Content = z.infer<typeof ContentDto>