/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import z from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { embeddingModel } from "@/lib/chat";
import { templates } from "@/utils/prompts";
import { ably } from "@/lib/ably";
import { v4 as uuid } from "uuid";
import { LLMChain, OpenAI, PromptTemplate } from "langchain";
import { getMatchesFromEmbeddings } from "@/lib/pinecone";
import type { Metadata } from "@/utils/types";
import { summarizeLongDocument } from "@/utils/summarizer";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CallbackManager } from "langchain/callbacks";

const llm = new OpenAI({});

export const chatRouter = createTRPCRouter({
  chat: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const channel = ably.channels.get("default");
        const interactionId = uuid();

        const inquiryChain = new LLMChain({
          llm,
          prompt: new PromptTemplate({
            template: templates.inquiryTemplate,
            inputVariables: ["userPrompt"],
          }),
        });

        const inquiryChainResult = await inquiryChain.call({
          userPrompt: prompt,
        });

        const inquiry = inquiryChainResult.text;

        channel.publish({
          data: {
            event: "status",
            message: "Embedding your inquiry...",
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const embeddings = await embeddingModel.embedQuery(inquiry);
        channel.publish({
          data: {
            event: "status",
            message: "Finding matches...",
          },
        });

        const matches = await getMatchesFromEmbeddings(embeddings, 3);

        channel.publish({
          data: {
            event: "status",
            message: `Found ${matches?.length} matches`,
          },
        });

        const urls =
          matches &&
          Array.from(
            new Set(
              matches.map((match) => {
                const metadata = match.metadata as Metadata;
                const { url } = metadata;
                return url;
              })
            )
          );

        const fullDocuments =
          matches &&
          Array.from(
            matches.reduce((map, match) => {
              const metadata = match.metadata as Metadata;
              const { text, url } = metadata;
              if (!map.has(url)) {
                map.set(url, text);
              }
              return map;
            }, new Map())
          ).map(([_, text]) => text);

        const chunkedDocs =
          matches &&
          Array.from(
            new Set(
              matches.map((match) => {
                const metadata = match.metadata as Metadata;
                const { chunk } = metadata;
                return chunk;
              })
            )
          );

        channel.publish({
          data: {
            event: "status",
            message: `Documents are summarized (they are ${
              fullDocuments?.join("").length
            } long)`,
          },
        });

        const summary = await summarizeLongDocument(
          fullDocuments.join("\n"),
          inquiry
        );

        channel.publish({
          data: {
            event: "status",
            message: `Documents are summarized. Forming final answer...`,
          },
        });

        const promptTemplate = new PromptTemplate({
          template: templates.qaTemplate,
          inputVariables: [
            "summaries",
            "question",
            "conversationHistory",
            "urls",
          ],
        });

        const chat = new ChatOpenAI({
          streaming: true,
          verbose: true,
          modelName: "gpt-3.5-turbo",
          callbackManager: CallbackManager.fromHandlers({
            async handleLLMNewToken(token) {
              console.log(token);
              channel.publish({
                data: {
                  event: "response",
                  token: token,
                  interactionId,
                },
              });
            },
            async handleLLMEnd(result) {
              channel.publish({
                data: {
                  event: "responseEnd",
                  token: "END",
                  interactionId,
                },
              });
            },
          }),
        });

        const chain = new LLMChain({
          prompt: promptTemplate,
          llm: chat,
        });

        const res = await chain.call({
          summaries: summary,
          question: prompt,
          urls,
        });

        return {
          data: res,
        };
      } catch (e) {
        console.log("Error: ", e);
      }
    }),
});
