"use client";
import React, { useState, useEffect, use } from "react";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/navbar";
import dynamic from "next/dynamic";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from "@codemirror/lang-python";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});

const QuestionPage = () => {
  // Define a custom EditorView theme for font size
  const customTheme = EditorView.theme({
    "&": {
      fontSize: "16px",
    },
  });

  const problem = {
    question:
      "# Correlation and Regression Lines - A Quick Recap #1\n\nIn this **problem**, 1. you'll analyze the relationship between variables using statistical methods.\n\n## Instructions:\n- Calculate the correlation coefficient\n- Find the regression line equation\n- Make predictions using your mode \n `print('hello')`   Correlation and Regression Lines - A Quick Recap #1\n\nIn this **problem**, 1. you'll analyze the relationship between variables using statistical methods.\n\n## Instructions:\n- Calculate the correlation coefficient\n- Find the regression line equation\n- Make predictions using your mode \n `print('hello')`  ",
  };

  // Initial Python code template
  const initialCode = `# Write your Python code here\n`;

  const [fullscreen, setFullscreen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [key, setKey] = useState(0); // Add a key state

  const handleReset = () => {
    setCode(initialCode);
    setKey((prevKey) => prevKey + 1); // Update the key to force re-render
  };

  const savedCode = "savedCode" + useParams().qid;
  const handleSave = () => {
    localStorage.setItem(savedCode, code);
    // alert("Code saved successfully!");
    toast.success("Code saved successfully!", {});
  };
  const handleSubmit = () => {
    localStorage.setItem(savedCode, code);

    toast.success("Code submitted successfully!", {
      style: {
        backgroundColor: "#088255",
        color: "white",
      },
    });
  };
  const handleRun = () => {
    // alert("Code submitted successfully!");
  };
  useEffect(() => {
    if (localStorage.getItem(savedCode)) {
      setCode(localStorage?.getItem(savedCode) || initialCode);
    } else {
      setCode(initialCode);
    }
  }, []);
  return (
    <div className="bg-[#020609] text-white h-[100vh] overflow-hidden">
      <Navbar />
      <ResizablePanelGroup
        direction="horizontal"
        className="max-w-md rounded-lg md:min-w-full h-dvh"
      >
        <ResizablePanel
          defaultSize={45}
          maxSize={60}
          minSize={20}
          className={`${fullscreen ? "hidden" : ""}`}
        >
          <div className="h-[90vh] p-6 prose prose-invert max-w-none overflow-y-auto">
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
        <ResizablePanel defaultSize={55}>
          <div className="w-full h-full p-6">
            <div className="flex justify-end w-full gap-2 bg-[#151616] mb-3 rounded-md p-2">
              <Button
                onClick={() => {
                  setFullscreen(!fullscreen);
                }}
              >
                {fullscreen ? "Exit Fullscreen" : " Fullscreen"}
              </Button>
              <Button onClick={handleReset}>Reset</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
            <div>
              <CodeMirror
                key={key} // Use the key state here
                value={code}
                theme={vscodeDark}
                height="60vh"
                width="100%"
                className="h-full text-baserounded-md"
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
                onChange={(value) => setCode(value)}
              />
            </div>
            <div className="flex w-full gap-2 bg-[#151616] my-1 rounded-md p-2">
              <div className="flex justify-between w-full">
                <Button variant={"outline"} className="bg-transparent dark">
                  Upload Code as a File
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={"secondary"}
                    className="dark"
                    onClick={handleRun}
                  >
                    Run Code
                  </Button>
                  <Button
                    className="text-white bg-green-500 hover:bg-green-700"
                    onClick={handleSubmit}
                  >
                    Submit Code
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default QuestionPage;
