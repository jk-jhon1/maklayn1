import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(12000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ai: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(chatMessageSchema).min(1).max(30) }))
      .mutation(async ({ input }) => {
        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Você é a Maklayn, uma IA educacional e de pesquisa que responde em português do Brasil. Separe fatos, inferências e incertezas. Não invente fontes, URLs, autores ou resultados. Seja clara, pedagógica e concisa. Quando o usuário pedir pesquisa, diga quais fontes precisam ser verificadas se você não tiver acesso a elas.",
            },
            ...input.messages,
          ],
          maxTokens: 900,
        });
        const content = result.choices?.[0]?.message?.content;
        return { content: typeof content === "string" ? content : "" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
