/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ConversationEntry } from "@/utils/types";
import clsx from "clsx";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface ChatProps {
  messages: ConversationEntry[];
  loading?: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, loading }) => {
  return (
    <div className="h-[680px] w-full overflow-y-auto rounded-md border border-stone-300/50 p-4 shadow-inner">
      <div className="flex w-full flex-col gap-3">
        {messages.map((msg: ConversationEntry, i) => (
          <div
            key={i}
            className={clsx(
              "w-fit rounded-t-md p-3",
              msg.speaker === "user"
                ? "place-self-end rounded-l-md bg-slate-300 text-slate-950"
                : "rounded-r-md bg-slate-900 text-slate-200"
            )}
          >
            <ReactMarkdown
              children={msg.message}
              className="leading-relaxed"
              components={{
                code({ inline, children, ...props }) {
                  return (
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, "")}
                      style={dracula}
                      language={"typescript"}
                      wrapLines
                      useInlineStyles={inline}
                      wrapLongLines
                    />
                  );
                },
                a({ children, ...props }) {
                  return (
                    <a
                      {...props}
                      target="_blank"
                      className="rounded-md bg-slate-700 p-1 text-sm text-blue-500"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            />
          </div>
        ))}
        {loading && <div>...</div>}
      </div>
    </div>
  );
};

export default Chat;
