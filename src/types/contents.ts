import { z } from "zod";

export const ContentDto = z.object({
    id: z.string().optional(),
    element_id: z.string().optional(),
    name: z.string().nullable(),
    text: z.string().nullable(),
    image: z.string().nullable(),
    time_of_death: z.string().nullable(),
    victim:z.boolean().nullable(),
})


export type UpdateContentDto = {
    element_id: string;
    value: Content
}
export type Content = z.infer<typeof ContentDto>