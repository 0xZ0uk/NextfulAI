/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { MarkdownTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { vectorStore } from "@/lib/chat";

export const vectorDBRouter = createTRPCRouter({
  upsert: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(input.url, { mode: "no-cors" });
        const htmlToString = await response.text();
        const $ = cheerio.load(htmlToString);

        const $elements = $(
          "h1, h2, h3, h4, h5, h6, p, li, blockquote, code, pre"
        );

        if (!$elements) {
          console.error("error::cheerio::scrapeRouter");
        }

        const turndownService = new TurndownService();
        const elemString = $elements.toString().replace(/\n/g, "");

        const markdown = turndownService.turndown(elemString);

        const textSplitter = new MarkdownTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 20,
        });

        const chunks = await textSplitter.splitText(markdown);

        const docs = chunks.map((chunk) => {
          return new Document({
            metadata: { url: input.url },
            pageContent: chunk,
          });
        });

        await vectorStore.addDocuments(docs);

        return {
          data: markdown,
        };
      } catch (e) {
        console.log("ERROR: ", e);
      }
    }),
  spider: publicProcedure
    .input(z.object({ sitemap: z.string(), match: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(input.sitemap, { mode: "no-cors" });
        const xmlToString = await response.text();
        const $ = cheerio.load(xmlToString, {
          xml: true,
        });

        const $elems = $("loc")
          .text()
          .split("https://")
          .filter((el) => el.includes(input.match));

        $elems.shift();

        return {
          data: $elems,
        };
      } catch (e) {
        console.log("ERROR: ", e);
      }
    }),
});
