/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { BaseChatMessage } from "@/utils/types";
import clsx from "clsx";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface ChatProps {
  messages: BaseChatMessage[];
}

const Chat: React.FC<ChatProps> = ({ messages }) => {
  return (
    <div className="h-[680px] w-full overflow-y-auto rounded-md border border-stone-300/50 p-4 shadow-inner">
      <div className="flex w-full flex-col gap-3">
        {messages.map((msg: BaseChatMessage, i) => (
          <div
            key={i}
            className={clsx(
              "w-fit rounded-t-md p-3",
              msg.role === "user"
                ? "place-self-end rounded-l-md bg-slate-300 text-slate-950"
                : "rounded-r-md bg-slate-900 text-slate-200"
            )}
          >
            <ReactMarkdown
              children={msg.text}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, "")}
                      style={dracula}
                      language={match[1]}
                      wrapLines
                      wrapLongLines
                      PreTag="div"
                    />
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
