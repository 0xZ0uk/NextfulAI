import z from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { chain } from "@/lib/chat";
import { chatPrompt } from "@/utils/prompts";

export const chatRouter = createTRPCRouter({
  chat: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      const response = await chain.call({
        query: input.message,
        prompt: chatPrompt,
      });

      return {
        data: response,
      };
    }),
});
