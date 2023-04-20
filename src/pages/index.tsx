/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "@/utils/api";
import React from "react";
import Input from "@/components/Input";
import Chat from "@/components/Chat";
import type { BaseChatMessage, ConversationEntry } from "@/utils/types";
import { RxGear } from "react-icons/rx";
import Drawer from "@/components/Drawer";
import { useChannel } from "@ably-labs/react-hooks";
import type { Types } from "ably";

const updateChatbotMessage = (
  conversation: ConversationEntry[],
  message: Types.Message
): ConversationEntry[] => {
  const interactionId = message.data.interactionId;

  const updatedConversation = conversation.reduce(
    (acc: ConversationEntry[], e: ConversationEntry) => [
      ...acc,
      e.id === interactionId
        ? { ...e, message: e.message + message.data.token }
        : e,
    ],
    []
  );

  return conversation.some((e) => e.id === interactionId)
    ? updatedConversation
    : [
        ...updatedConversation,
        {
          id: interactionId,
          message: message.data.token,
          speaker: "assistant",
          date: new Date(),
        },
      ];
};

const Home: NextPage = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>("");
  const [conversation, setConversation] = React.useState<ConversationEntry[]>(
    []
  );
  const [crawlUrl, seCrawlUrl] = React.useState<string>("");
  const [statusMessage, setStatusMessage] = React.useState(
    "Waiting for query..."
  );

  const { mutate: upsert } = api.vectorDB.upsert.useMutation();
  const { mutate: chat, data: reply } = api.chat.chat.useMutation();

  const { mutate: spider, data: crawled } = api.vectorDB.spider.useMutation();

  const onUpsertAll = () => {
    if (crawled?.data) {
      crawled.data.map((c) => {
        upsert({ url: "https://" + c });
      });
    }
  };

  const onSpiderCrawl = () => {
    spider({
      sitemap: crawlUrl,
      match: "/docs/",
    });
  };

  const onChangeInput = (value: string) => {
    setInput(value);
  };

  const onSubmitInput = () => {
    setAiLoading(true);
    setConversation((state) => [
      ...state,
      {
        message: input,
        speaker: "user",
        date: new Date(),
      },
    ]);

    chat({ prompt: input, conversation });
    setAiLoading(false);
    setInput("");
  };

  useChannel("default", (message) => {
    switch (message.data.event) {
      case "response":
        setConversation((state) => updateChatbotMessage(state, message));
        break;
      case "status":
        setStatusMessage(message.data.message);
        break;
      case "responseEnd":
      default:
        setAiLoading(false);
        setStatusMessage("Waiting for query...");
    }
  });

  React.useEffect(() => {
    if (
      !!reply &&
      reply.data.text !== "" &&
      conversation[conversation.length - 1]?.speaker === "user" &&
      reply.data.text !== conversation[conversation.length - 1]?.message
    ) {
      setConversation((state) => [
        ...state,
        {
          message: reply.data.text as string,
          speaker: "assistant",
          date: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reply]);

  return (
    <>
      <Head>
        <title>Contentful + NextJS AI Docs</title>
        <meta
          name="description"
          content="A LLM powered documentation for Contentful and NextJS"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white from-70% to-stone-300">
        <div className="absolute left-8 top-8 w-96 rounded-md bg-red-500 p-4 text-white">
          <strong>WARNING:</strong> Due to my Vercel &quot;Hobby Plan&quot;
          requests to the API will TimeOut after 10 seconds, and AI messages may
          be imcomplete.
        </div>
        <div className="flex w-1/2 flex-col gap-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-4">
              <img
                src="https://www.contentful.com/developers/_assets/logo.74f883e83b.svg"
                alt="Contentful"
                height={50}
                width={50}
              />
              +
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nextjs-logo.svg/788px-Nextjs-logo.svg.png"
                alt="NextJS"
                height={100}
                width={100}
              />
              <div className="relative top-4 rounded-md bg-slate-950 p-1 text-xs text-slate-100">
                BETA
              </div>
            </div>
            <p className="text-sm text-slate-500">
              AI documentation for Contentful and NextJS powered by ChatGPT
            </p>
          </div>
          <Chat messages={conversation} loading={aiLoading} />
          <Input
            value={input}
            placeholder="Ask any question related to Contentful or NextJS"
            onChange={onChangeInput}
            onSubmit={onSubmitInput}
          />
        </div>
        {process.env.NODE_ENV !== "production" && (
          <>
            <div
              className="absolute bottom-8 right-8 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-3xl text-slate-50"
              onClick={() => setOpen(true)}
            >
              <RxGear className="mx-auto" />
            </div>
            <Drawer open={open} onClose={() => setOpen(false)}>
              <div>
                <h1 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-600">
                  Debug Menu:
                </h1>
                <Input
                  label="Sitemap URL"
                  value={crawlUrl}
                  extra={`Crawled: ${crawled?.data.length || 0}`}
                  placeholder="URL to crawl"
                  onChange={(value) => seCrawlUrl(value)}
                  onSubmit={onSpiderCrawl}
                />
                <button
                  className="text-slate h-12 w-full rounded-md bg-slate-900 text-slate-50 disabled:bg-slate-700 disabled:text-slate-500"
                  disabled={!crawled?.data || crawled?.data.length < 1}
                  onClick={onUpsertAll}
                >
                  Upsert Crawled
                </button>
              </div>
            </Drawer>
          </>
        )}
      </main>
    </>
  );
};

export default Home;
