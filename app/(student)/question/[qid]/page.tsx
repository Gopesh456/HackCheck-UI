"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/navbar";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from "@codemirror/lang-python";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const QuestionPage = () => {
  // Define a custom EditorView theme for font size
  const customTheme = EditorView.theme({
    "&": {
      fontSize: "16px",
    },
  });

  const problem = {
    question:
      "# Correlation and Regression Lines - A Quick Recap #1\n\nIn this **problem**, 1. you'll analyze the relationship between variables using statistical methods.\n\n## Instructions:\n- Calculate the correlation coefficient\n- Find the regression line equation\n- Make predictions using your mode \n `print('hello')`  ",
  };

  // Initial Python code template
  const initialCode = `# Write your Python code here
`;

  return (
    <div className="bg-[#020609] text-white">
      <Navbar />
      <ResizablePanelGroup
        direction="horizontal"
        className="max-w-md rounded-lg md:min-w-full h-dvh"
      >
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="h-full p-6 prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  return inline ? (
                    <code
                      className="rounded bg-zinc-700 px-1.5 py-0.5 text-sm font-mono text-zinc-200 w-[200px]"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className="block w-full p-4 my-3 overflow-x-auto font-mono rounded-md bg-zinc-800 text-zinc-200"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="p-2 pl-4 my-3 italic border-l-4 border-zinc-500 bg-zinc-900 rounded-r-md"
                    {...props}
                  />
                ),
                h1: ({ node, ...props }) => (
                  <h1
                    className="mb-4 text-2xl font-bold text-white"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="my-3 text-xl font-bold text-white"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="ml-6 list-disc" {...props} />
                ),
                li: ({ node, ...props }) => <li className="my-1" {...props} />,
                strong: ({ node, ...props }) => (
                  <strong className="font-bold " {...props} />
                ),
              }}
            >
              {problem.question}
            </ReactMarkdown>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="w-[0.2rem] dark" />
        <ResizablePanel defaultSize={50}>
          <div className="w-full h-full p-6">
            <CodeMirror
              value={initialCode}
              theme={vscodeDark}
              height="90vh"
              width="100%"
              className="h-full text-base border border-gray-800 rounded-md"
              extensions={[
                python(),
                customTheme,
                autocompletion({ activateOnTyping: true }),
                closeBrackets(),
                EditorView.lineWrapping,
              ]}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                foldGutter: true,
                autocompletion: true,
                bracketMatching: true,
                closeBrackets: true,
                indentOnInput: true,
              }}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default QuestionPage;
