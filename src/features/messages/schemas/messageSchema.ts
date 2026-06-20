import {z} from "zod"
export const messageSchema=z.object({
  content:z
  .string()
  .trim()
  .min(10,{message:"content must be atleast of 10 character"})
  .max(300,{message:"content must be no longer than 300 character"}),
})
