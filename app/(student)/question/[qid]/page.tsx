"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { fetchData } from "@/utils/api";
import Navbar from "@/components/navbar";
import dynamic from "next/dynamic";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from "@codemirror/lang-python";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Script from "next/script";
import { X } from "lucide-react";

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

  const params = useParams();
  const [questionData, setQuestionData] = useState({
    title: "",
    description: "",
    samples: { input: [], output: [] },
    tests: { input: [], output: [] },
  });
  const [loading, setLoading] = useState(true);

  // Initial Python code template
  const initialCode = `# Write your Python code here\n`;

  // Test cases will be generated from the question data
  const [testCases, setTestCases] = useState([]);
  const [hiddenTestCases, setHiddenTestCases] = useState([]);

  const [fullscreen, setFullscreen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [key, setKey] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);
  const [allHiddenTestsPassed, setAllHiddenTestsPassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skulptLoaded, setSkulptLoaded] = useState(false);

  // Reference to file input element
  const fileInputRef = useRef(null);

  // Fetch question data
  const fetchQuestionData = async () => {
    try {
      setLoading(true);
      // Use the question ID from the URL params
      const questionId = params.qid;

      // Make the API request to get the question
      const response = await fetchData("get_question/", "POST", {
        question_number: questionId,
      });

      // Check if response is already parsed JSON
      let data;
      if (typeof response === "object" && !response.json) {
        // Response is already parsed JSON
        data = response;
      } else if (response && typeof response.json === "function") {
        // Response is a proper Response object
        if (!response.ok) {
          throw new Error(
            `Failed to fetch question data: ${response.status} ${response.statusText}`
          );
        }
        data = await response.json();
      } else {
        throw new Error("Invalid response format from API");
      }

      if (data.length === 0) {
        throw new Error("Question data is empty or invalid format");
      }

      // Set the question data
      const question = data;
      setQuestionData(question);

      // Create test cases from the samples
      if (
        question.samples &&
        Array.isArray(question.samples.input) &&
        Array.isArray(question.samples.output)
      ) {
        const newTestCases = question.samples.input.map((input, index) => ({
          id: index + 1,
          input: input,
          expectedOutput: question.samples.output[index] || "",
          actualOutput: "",
          status: null, // will be "pass" or "fail"
        }));

        setTestCases(newTestCases);
        setTestResults(newTestCases);
      } else {
        throw new Error("Sample test cases missing or in wrong format");
      }

      // Create hidden test cases from the tests
      if (
        question.tests &&
        Array.isArray(question.tests.input) &&
        Array.isArray(question.tests.output)
      ) {
        const newHiddenTestCases = question.tests.input.map((input, index) => ({
          id: index + 1,
          input: input,
          expectedOutput: question.tests.output[index] || "",
        }));

        setHiddenTestCases(newHiddenTestCases);
      } else {
        throw new Error("Hidden test cases missing or in wrong format");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error(`Failed to load question data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setKey((prevKey) => prevKey + 1);
    setTestResults([...testCases]); // Reset test results
  };

  const savedCode = "savedCode" + params.qid;
  const handleSave = () => {
    localStorage.setItem(savedCode, code);
    toast.success("Code saved successfully!", {});
  };

  // Function to run code against hidden test cases
  const runHiddenTests = async (userCode) => {
    let allPassed = true;

    for (const testCase of hiddenTestCases) {
      try {
        const output = await runCodeWithInput(userCode, testCase.input);
        
        // Check if there was an error in the execution
        const hasError = output.startsWith("Error:");
        const isPassing =
          !hasError && output.trim() === testCase.expectedOutput.trim();

        if (!isPassing) {
          allPassed = false;
          break; // No need to run more tests once one fails
        }
      } catch (error) {
        allPassed = false;
        break;
      }
    }

    return allPassed;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    localStorage.setItem(savedCode, code);
    
    // Run hidden tests
    const passed = await runHiddenTests(code);
    // await fetchData("submit/", "POST", {code: code, question_number: params.qid, is_correct_answer: passed,tests:});
    setAllHiddenTestsPassed(passed);

    setIsSubmitting(false);

    toast.success("Code submitted successfully!", {
      style: {
        backgroundColor: passed ? "#088255" : "#d32f2f",
        color: "white",
      },
      description: passed
        ? "All tests passed!"
        : "Some tests failed. Try again!!",
    });
  };

  const runCodeWithInput = async (code, input) => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.Sk) {
        reject(new Error("Skulpt is not loaded yet"));
        return;
      }

      let outputText = "";
      let inputIndex = 0;
      let inputLines = input.toString().split("\n");

      function outf(text) {
        outputText += text;
      }

      function builtinRead(x) {
        if (x !== "<stdin>") {
          if (
            window.Sk.builtinFiles === undefined ||
            window.Sk.builtinFiles["files"][x] === undefined
          ) {
            throw "File not found: '" + x + "'";
          }
          return window.Sk.builtinFiles["files"][x];
        }

        // Return the predefined input
        if (inputIndex < inputLines.length) {
          return inputLines[inputIndex++];
        }
        return "";
      }

      // Prepare Skulpt
      window.Sk.configure({
        output: outf,
        read: builtinRead,
        __future__: window.Sk.python3,
        inputfun: function () {
          // This prevents actual prompting for input
          if (inputIndex < inputLines.length) {
            return inputLines[inputIndex++];
          }
          return "";
        },
      });

      // Run the original code as-is
      window.Sk.misceval
        .asyncToPromise(() => {
          return window.Sk.importMainWithBody("<stdin>", false, code, true);
        })
        .then(() => {
          resolve(outputText.trim());
        })
        .catch((error) => {
          // Any exception means the test case failed
          resolve(`Error: ${error.toString()}`);
        });
    });
  };

  const handleRun = async () => {
    setIsLoading(true);
    setShowTestResults(true); // Show test results when running tests

    if (!skulptLoaded) {
      toast.error(
        "Python interpreter is not loaded yet. Please wait a moment and try again.",
        {
          duration: 3000,
          style: { backgroundColor: "#d32f2f", color: "white" },
        }
      );
      setIsLoading(false);
      return;
    }

    // Create a copy of test cases to update
    const updatedTestResults = [...testResults];

    // Run each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        const output = await runCodeWithInput(code, testCase.input);

        // Check if there was an error in the execution
        const hasError = output.startsWith("Error:");

        updatedTestResults[i] = {
          ...testCase,
          actualOutput: output,
          // If there's an error, mark as failed immediately
          status: hasError
            ? "fail"
            : output.trim() === testCase.expectedOutput.trim()
            ? "pass"
            : "fail",
        };
      } catch (error) {
        updatedTestResults[i] = {
          ...testCase,
          actualOutput: `Error: ${error.toString()}`,
          status: "fail",
        };
      }
    }

    setTestResults(updatedTestResults);
    setIsLoading(false);
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is a Python file
    if (!file.name.endsWith(".py")) {
      toast.error("Please upload a Python (.py) file", {
        style: { backgroundColor: "#d32f2f", color: "white" },
      });
      return;
    }

    // Read the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setCode(content);
      setKey((prevKey) => prevKey + 1); // Force editor refresh
      toast.success(`File "${file.name}" uploaded successfully!`);
    };
    reader.onerror = () => {
      toast.error("Error reading file", {
        style: { backgroundColor: "#d32f2f", color: "white" },
      });
    };
    reader.readAsText(file);

    // Reset file input value so the same file can be uploaded again
    event.target.value = null;
  };

  // Handle Skulpt loading
  const handleSkulptLoad = () => {
    if (window.Sk && window.Sk.misceval) {
      setSkulptLoaded(true);
    } else {
      console.error("Failed to load Skulpt");
    }
  };

  useEffect(() => {
    // Fetch question data when component mounts
    fetchQuestionData();

    if (localStorage.getItem(savedCode)) {
      setCode(localStorage?.getItem(savedCode) || initialCode);
    } else {
      setCode(initialCode);
    }

    // Check if Skulpt is already loaded
    if (typeof window !== "undefined" && window.Sk && window.Sk.misceval) {
      setSkulptLoaded(true);
    }
  }, [params.qid]);

  return (
    <div className="bg-[#020609] text-white h-[100vh] overflow-hidden">
      <Script src="/skulpt.min.js" strategy="afterInteractive" />
      <Script
        src="/skulpt-stdlib.js"
        strategy="afterInteractive"
        onLoad={handleSkulptLoad}
        onError={() => console.error("Failed to load Skulpt stdlib")}
      />
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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-xl">Loading question...</div>
              </div>
            ) : (
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
                  li: ({ node, ...props }) => (
                    <li className="my-1" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold " {...props} />
                  ),
                }}
              >
                {questionData.description}
              </ReactMarkdown>
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="w-[0.2rem] dark" />
        <ResizablePanel defaultSize={55}>
          <div className="w-full p-6 overflow-y-auto h-[90vh]">
            <div className="flex justify-end w-full gap-2 bg-[#151616] mb-3 rounded-md p-2 ">
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
                key={key}
                value={code}
                theme={vscodeDark}
                height={showTestResults ? "40vh" : "60vh"} // Adjust height based on test results visibility
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

            {/* Test Results Area - Only shown when showTestResults is true */}
            {showTestResults && (
              <div className="mt-4 mb-2 bg-[#0d1117] border border-gray-700 rounded-md">
                <div className="px-4 py-2 bg-[#161b22] border-b border-gray-700 font-mono text-sm flex items-center rounded-t-md justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => setShowTestResults(false)}
                      className="p-1 mr-3 rounded-md hover:bg-gray-700"
                      aria-label="Close test results"
                    >
                      <X size={16} />
                    </button>
                    <span>Test Results</span>
                  </div>
                  <span className="text-xs">
                    {
                      testResults.filter((test) => test.status === "pass")
                        .length
                    }{" "}
                    / {testResults.length} Passed
                  </span>
                </div>
                <div className="p-4 h-[20vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="py-4 text-center">Running tests...</div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      {testResults.map((test) => (
                        <div
                          key={test.id}
                          className={`border rounded-md p-3 ${
                            test.status === "pass"
                              ? "border-green-500 bg-green-900/20"
                              : test.status === "fail"
                              ? "border-red-500 bg-red-900/20"
                              : "border-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              Test Case {test.id}
                            </span>
                            {test.status && (
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  test.status === "pass"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              >
                                {test.status === "pass" ? "Passed" : "Failed"}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="mb-1 text-gray-400">Input:</div>
                              <div className="p-2 font-mono rounded bg-black/30">
                                {test.input}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 text-gray-400">
                                Expected:
                              </div>
                              <div className="p-2 font-mono rounded bg-black/30">
                                {test.expectedOutput}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 text-gray-400">
                                Your Output:
                              </div>
                              <div className="p-2 overflow-x-auto font-mono rounded bg-black/30">
                                {test.actualOutput || "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex w-full gap-2 bg-[#151616] my-1 rounded-md p-2">
              <div className="flex justify-between w-full">
                <Button
                  variant={"outline"}
                  className="bg-transparent dark"
                  onClick={handleUploadClick}
                >
                  Upload Code as a File
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={"secondary"}
                    className="dark"
                    onClick={handleRun}
                    disabled={isLoading}
                  >
                    {isLoading ? "Running Tests..." : "Run Tests"}
                  </Button>
                  <Button
                    className="text-white bg-green-500 hover:bg-green-700"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Code"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".py"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default QuestionPage;
