"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import { fetchData } from "@/utils/api";
import Navbar from "@/components/navbar";
import dynamic from "next/dynamic";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from "@codemirror/lang-python";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { EditorView, type ViewUpdate } from "@codemirror/view";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { X, AlertTriangle } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

declare global {
  interface Window {
    Sk: {
      builtinFiles: {
        files: { [key: string]: string };
      };
      configure: (options: { [key: string]: unknown }) => void;
      importMainWithBody: (
        name: string,
        dump: boolean,
        body: string,
        canSuspend: boolean
      ) => Promise<string | void>;
      misceval: {
        asyncToPromise: (func: () => unknown) => Promise<unknown>;
      };
      python3: unknown;
    };
  }
}

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

  // Define test case type
  type TestCase = {
    id: number;
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    status?: "pass" | "fail" | null;
  };

  // Test cases will be generated from the question data
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [hiddenTestCases, setHiddenTestCases] = useState<
    { input: string; expectedOutput: string }[]
  >([]);

  const [fullscreen, setFullscreen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [key, setKey] = useState(0);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skulptLoaded, setSkulptLoaded] = useState(false);
  const [skulptLoadingError, setSkulptLoadingError] = useState<string | null>(
    null
  );

  // Reference to file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep a reference to the current CodeMirror view to manage cursor position
  const editorRef = useRef<EditorView | null>(null);

  // Page monitoring states
  const [pageLeaveCount, setPageLeaveCount] = useState(0);
  const [totalTimeAway, setTotalTimeAway] = useState(0);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const timeAwayRef = useRef<number | null>(null);

  // Function to autosave code to localStorage without moving cursor
  const handleAutoSave = (newCode: string, viewUpdate?: ViewUpdate) => {
    // Store the editor reference when available
    if (viewUpdate && !editorRef.current) {
      editorRef.current = viewUpdate.view;
    }

    // Update the code state only when it's needed for other operations
    // but not during typical typing to avoid cursor resets
    setCode(newCode);

    // Clear any existing timeout to debounce the save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set autosaving indicator
    setAutoSaving(true);

    // Create a new timeout to save after 1 second of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Save to localStorage without causing re-renders
      localStorage.setItem(savedCode, newCode);

      // Clear the autosaving indicator after a brief delay
      setTimeout(() => {
        setAutoSaving(false);
      }, 500);
    }, 1000);
  };

  // Clean up the timeout on component unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Function to preprocess code before execution - fixing input() statements and handling eval()
  const preprocessCode = (code: string): string => {
    // First, replace input("any text here") with just input()
    // This regex matches input() with any string inside (handling quotes correctly)
    let processedCode = code.replace(
      /input\s*\(\s*(?:["'].*?["']|'''.*?'''|""".*?""")\s*\)/g,
      "input()"
    );

    // Check if the code contains eval()
    if (processedCode.includes("eval(")) {
      // Add our custom eval implementation at the beginning of the code
      const customEvalImplementation = `
# Custom implementation of eval() function for Skulpt
def custom_eval(expr):
    # Convert the expression to a string if it's not already
    expr_str = str(expr)
    
    # Handle basic numeric operations
    try:
        # Try direct numeric evaluation first
        return float(expr_str) if '.' in expr_str else int(expr_str)
    except ValueError:
        pass
    
    # Handle basic math operations
    import re
    
    # Simple arithmetic operations
    if re.match(r'^\\s*\\d+\\s*[+\\-*/]\\s*\\d+\\s*$', expr_str):
        return eval_arithmetic(expr_str)
    
    # Handle list/tuple literals
    if expr_str.startswith('[') and expr_str.endswith(']'):
        # Simple list parsing
        items = expr_str[1:-1].split(',')
        return [custom_eval(item.strip()) for item in items if item.strip()]
    
    if expr_str.startswith('(') and expr_str.endswith(')'):
        # Simple tuple parsing
        items = expr_str[1:-1].split(',')
        return tuple(custom_eval(item.strip()) for item in items if item.strip())
    
    # If we can't handle it, return the original expression
    return expr_str

def eval_arithmetic(expr):
    # Very simple evaluation of basic arithmetic
    import re
    # Find numbers and operator
    match = re.match(r'^\\s*(\\d+(?:\\.\\d+)?)\\s*([+\\-*/])\\s*(\\d+(?:\\.\\d+)?)\\s*$', expr)
    if match:
        a, op, b = match.groups()
        a = float(a) if '.' in a else int(a)
        b = float(b) if '.' in b else int(b)
        
        if op == '+': return a + b
        if op == '-': return a - b
        if op == '*': return a * b
        if op == '/': return a / b
    
    return expr
`;

      // Replace all eval() calls with our custom_eval()
      processedCode =
        customEvalImplementation +
        processedCode.replace(/eval\s*\(/g, "custom_eval(");
    }

    return processedCode;
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    localStorage.setItem(savedCode, code);

    // Run hidden tests and collect results
    let allPassed = true;
    const testResultsObj: {
      [key: string]: {
        input: string;
        expected: string;
        actual: string;
        passed: boolean;
      };
    } = {};

    for (let i = 0; i < hiddenTestCases.length; i++) {
      const testCase = hiddenTestCases[i];
      try {
        const output = await runCodeWithInput(code, testCase.input);

        // Check if there was an error in the execution
        const hasError = (output as string).startsWith("Error:");
        const isPassing =
          !hasError &&
          (output as string).trim() === testCase.expectedOutput.trim();

        testResultsObj[`test_${i + 1}`] = {
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: output as string,
          passed: isPassing,
        };

        if (!isPassing) {
          allPassed = false;
        }
      } catch (error) {
        testResultsObj[`test_${i + 1}`] = {
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: `Error: ${(error as Error).message}`,
          passed: false,
        };
        allPassed = false;
      }
    }

    // Send results to server
    try {
      await fetchData("submit/", "POST", {
        code: code,
        question_number: params.qid,
        is_correct_answer: allPassed,
        tests: testResultsObj,
      });
    } catch (error) {
      console.error("Error submitting code:", error);
      toast.error("Error submitting code to server");
    }

    setIsSubmitting(false);

    toast.success("Code submitted successfully!", {
      style: {
        backgroundColor: allPassed ? "#088255" : "#d32f2f",
        color: "white",
      },
      description: allPassed
        ? "All tests passed!"
        : "Some tests failed. Try again!!",
    });
  };

  const runCodeWithInput = async (code: string, input: string) => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.Sk) {
        reject(new Error("Skulpt is not loaded yet"));
        return;
      }

      try {
        // Preprocess the code to handle input() function properly and add eval() support
        const processedCode = preprocessCode(code);

        let outputText = "";
        let inputIndex = 0;
        const inputLines = input.toString().split("\n");

        // Function to handle output from Skulpt
        function outf(text: string): void {
          outputText += text;
        }

        // Function to read files required by Skulpt
        function builtinRead(x: string): string {
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

        // Run the processed code
        window.Sk.misceval
          .asyncToPromise(() => {
            return window.Sk.importMainWithBody(
              "<stdin>",
              false,
              processedCode,
              true
            );
          })
          .then(() => {
            resolve(outputText.trim());
          })
          .catch((error) => {
            // Any exception means the test case failed
            resolve(`Error: ${error.toString()}`);
          });
      } catch (error) {
        reject(error);
      }
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
        const hasError =
          typeof output === "string" && output.startsWith("Error:");
        const outputStr = typeof output === "string" ? output : String(output);

        updatedTestResults[i] = {
          ...testCase,
          actualOutput: outputStr,
          // If there's an error, mark as failed immediately
          status: hasError
            ? "fail"
            : outputStr.trim() === testCase.expectedOutput.trim()
            ? "pass"
            : "fail",
        };
      } catch (error) {
        updatedTestResults[i] = {
          ...testCase,
          actualOutput: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = (e.target as FileReader).result as string;
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
    event.target.value = "";
  };

  // Handle Skulpt loading
  const handleSkulptLoad = () => {
    if (window.Sk && window.Sk.misceval) {
      setSkulptLoaded(true);
      setSkulptLoadingError(null);
    } else {
      setSkulptLoadingError("Failed to initialize Skulpt interpreter");
      console.error("Failed to load Skulpt properly");
    }
  };

  // Handle Skulpt loading error
  const handleSkulptError = () => {
    setSkulptLoadingError("Failed to load Skulpt libraries");
    console.error("Failed to load Skulpt");
  };

  // Function to log suspicious activity
  const logActivity = async (
    activityType: string,
    details: Record<string, unknown>
  ) => {
    console.log(activityType, details);
  };

  // Handle page visibility change (tab switching/minimizing)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Record time when page was hidden
        timeAwayRef.current = Date.now();

        setPageLeaveCount((prev) => prev + 1);

        logActivity("page_hidden", {
          event: "Page was hidden (tab switch or window minimize)",
          count: pageLeaveCount + 1,
        });
      } else if (
        document.visibilityState === "visible" &&
        timeAwayRef.current
      ) {
        // Calculate time away and update total
        const timeAway = Math.round((Date.now() - timeAwayRef.current) / 1000);
        setTotalTimeAway((prev) => prev + timeAway);

        // Show warning toast
        toast.warning(
          `You were away from the page for ${timeAway} seconds. This activity has been logged.`,
          {
            duration: 5000,
          }
        );

        logActivity("page_visible", {
          event: "Page became visible again",
          timeAway: timeAway,
          totalTimeAway: totalTimeAway + timeAway,
        });

        timeAwayRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [params.qid, pageLeaveCount, totalTimeAway]);

  // Track window focus and blur (clicking outside the browser)
  useEffect(() => {
    const handleBlur = () => {
      if (!timeAwayRef.current) {
        timeAwayRef.current = Date.now();

        setPageLeaveCount((prev) => prev + 1);

        logActivity("window_blur", {
          event: "Window lost focus (clicked outside browser)",
          count: pageLeaveCount + 1,
        });
      }
    };

    const handleFocus = () => {
      if (timeAwayRef.current) {
        const timeAway = Math.round((Date.now() - timeAwayRef.current) / 1000);
        setTotalTimeAway((prev) => prev + timeAway);

        toast.warning(
          `You clicked outside the browser for ${timeAway} seconds. This activity has been logged.`,
          {
            duration: 5000,
          }
        );

        logActivity("window_focus", {
          event: "Window regained focus",
          timeAway: timeAway,
          totalTimeAway: totalTimeAway + timeAway,
        });

        timeAwayRef.current = null;
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [params.qid, pageLeaveCount, totalTimeAway]);

  // Warn on page exit attempt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message =
        "Are you sure you want to leave? This action will be logged.";

      logActivity("page_exit_attempt", {
        event: "User attempted to leave/refresh the page",
      });

      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [params.qid]);

  useEffect(() => {
    // Moved fetchQuestionData function inside useEffect
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
          // Define an interface for the test case structure
          interface SampleTestCase {
            id: number;
            input: string;
            expectedOutput: string;
            actualOutput: string;
            status: "pass" | "fail" | null;
          }

          const newTestCases: SampleTestCase[] = question.samples.input.map(
            (input: string, index: number) => ({
              id: index + 1,
              input: input,
              expectedOutput: question.samples.output[index] || "",
              actualOutput: "",
              status: null, // will be "pass" or "fail"
            })
          );

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
          // Define an interface for hidden test cases
          interface HiddenTestCase {
            id: number;
            input: string;
            expectedOutput: string;
          }

          const newHiddenTestCases: HiddenTestCase[] = question.tests.input.map(
            (input: string, index: number) => ({
              id: index + 1,
              input: input,
              expectedOutput: question.tests.output[index] || "",
            })
          );

          setHiddenTestCases(newHiddenTestCases);
        } else {
          throw new Error("Hidden test cases missing or in wrong format");
        }
      } catch (error) {
        console.error("Error fetching question:", error);
        toast.error(
          `Failed to load question data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

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

    // Add a timeout to check if Skulpt failed to load
    const timeoutId = setTimeout(() => {
      if (!skulptLoaded && typeof window !== "undefined") {
        // If not loaded after 5 seconds, try loading from CDN again
        const skulptScript = document.createElement("script");
        skulptScript.src = "https://skulpt.org/js/skulpt.min.js";
        skulptScript.onload = () => {
          const stdlibScript = document.createElement("script");
          stdlibScript.src = "https://skulpt.org/js/skulpt-stdlib.js";
          stdlibScript.onload = handleSkulptLoad;
          stdlibScript.onerror = handleSkulptError;
          document.head.appendChild(stdlibScript);
        };
        skulptScript.onerror = handleSkulptError;
        document.head.appendChild(skulptScript);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [params.qid, initialCode, savedCode, skulptLoaded]);
  const handleShare = async () => {
    try {
      // Check code size limit (50KB is a reasonable limit)
      const MAX_CODE_SIZE = 25 * 1024; // 50KB in bytes/characters

      if (code.length > MAX_CODE_SIZE) {
        toast.error(
          `Code is too large to share (${(code.length / 1024).toFixed(
            2
          )}KB). Maximum size is ${MAX_CODE_SIZE / 1024}KB.`,
          {
            duration: 5000,
            style: { backgroundColor: "#d32f2f", color: "white" },
          }
        );
        return;
      }

      // Save the code to the server
      await fetchData("save_shared_code/", "POST", {
        question_number: params.qid,
        shared_code: code,
      });

      // Show success message
      toast.success("Code shared successfully!", {
        duration: 3000,
        style: { backgroundColor: "#088255", color: "white" },
      });
    } catch (error) {
      console.error("Error sharing code:", error);
      toast.error(
        `Failed to share code: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          duration: 3000,
          style: { backgroundColor: "#d32f2f", color: "white" },
        }
      );
    }
  };

  return (
    <div className="bg-[#020609] text-white h-[100vh] overflow-hidden">
      {/* Script tags remain unchanged */}
      <Navbar />

      {/* Warning Banner */}
      {showWarningBanner && (
        <div className="py-2 px-3 sm:px-4 bg-amber-700 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" />
            <span className="line-clamp-2 sm:line-clamp-none">
              <strong>Warning:</strong> Leaving this page or switching tabs is
              not allowed during the hackathon and will be logged.
              {pageLeaveCount > 0 &&
                ` You have left the page ${pageLeaveCount} times (${totalTimeAway} seconds total).`}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWarningBanner(false)}
            className="text-white hover:bg-amber-800 flex-shrink-0 ml-1"
          >
            <X size={16} />
          </Button>
        </div>
      )}

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
          <div className="h-[83vh] p-3 sm:p-6 prose prose-invert max-w-none overflow-y-auto text-sm sm:text-base">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-lg sm:text-xl">Loading question...</div>
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  code: ({ children, ...props }) => {
                    return (
                      <code
                        className="inline px-1 sm:px-2 py-0.5 sm:py-1 my-2 sm:my-3 overflow-x-auto font-mono rounded-md w-fit bg-zinc-900 text-zinc-200 text-xs sm:text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="p-1 sm:p-2 pl-3 sm:pl-4 my-2 sm:my-3 italic border-l-4 border-zinc-500 bg-zinc-900 rounded-r-md text-sm"
                      {...props}
                    />
                  ),
                  h1: ({ ...props }) => (
                    <h1
                      className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold text-white"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="my-2 sm:my-3 text-lg sm:text-xl font-bold text-white"
                      {...props}
                    />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="ml-4 sm:ml-6 list-disc" {...props} />
                  ),
                  li: ({ ...props }) => <li className="my-1" {...props} />,
                  strong: ({ ...props }) => (
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
          <div className="w-full p-3 sm:p-6 overflow-y-auto h-[90vh]">
            <div className="flex flex-wrap justify-end w-full gap-2 bg-[#151616] mb-3 rounded-md p-2">
              {!skulptLoaded && (
                <Button
                  variant="outline"
                  disabled
                  className="text-amber-500 border-amber-500 text-xs sm:text-sm"
                >
                  <span className="mr-2">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                  <span className="hidden sm:inline">
                    Loading Python Interpreter...
                  </span>
                  <span className="sm:hidden">Loading...</span>
                </Button>
              )}
              {skulptLoadingError && (
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500"
                  onClick={() => window.location.reload()}
                >
                  Python Interpreter Failed to Load. Click to Reload
                </Button>
              )}
              {autoSaving && (
                <span className="flex items-center text-xs text-gray-400">
                  <svg
                    className="w-3 h-3 mr-1 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Auto-saving...
                </span>
              )}
              <Button
                onClick={handleShare}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Share
              </Button>
              <Button
                onClick={() => {
                  setFullscreen(!fullscreen);
                }}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {fullscreen ? (
                  <span className="sm:hidden">Exit</span>
                ) : (
                  <span className="sm:hidden">Full</span>
                )}
                <span className="hidden sm:inline">
                  {fullscreen ? "Exit Fullscreen" : " Fullscreen"}
                </span>
              </Button>
              <Button
                onClick={handleReset}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Save
              </Button>
            </div>

            <Suspense fallback={<h1>loading....</h1>}>
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
                  onChange={(value, viewUpdate) =>
                    handleAutoSave(value, viewUpdate)
                  }
                />
              </div>
            </Suspense>

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
                                {test.input.split("\n").map((line, index) => (
                                  <React.Fragment key={index}>
                                    {line}
                                    <br />
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 text-gray-400">
                                Expected:
                              </div>
                              <div className="p-2 font-mono rounded bg-black/30">
                                {test.expectedOutput
                                  .split("\n")
                                  .map((line, index) => (
                                    <React.Fragment key={index}>
                                      {line}
                                      <br />
                                    </React.Fragment>
                                  ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 text-gray-400">
                                Your Output:
                              </div>
                              <div className="p-2 overflow-x-auto font-mono rounded bg-black/30">
                                {(() => {
                                  // Modify the output directly
                                  const modifiedOutput =
                                    test.actualOutput?.replace(
                                      /line (\d+)/g,
                                      (_, num) => `line ${parseInt(num) - 50}`
                                    ) || "";

                                  // Return the JSX we want to render
                                  return (
                                    modifiedOutput
                                      .split("\n")
                                      .map((line, index) => (
                                        <React.Fragment key={index}>
                                          {line}
                                          <br />
                                        </React.Fragment>
                                      )) || "-"
                                  );
                                })()}
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

            <div className="flex flex-wrap w-full gap-2 bg-[#151616] my-1 rounded-md p-2">
              <div className="flex flex-col sm:flex-row justify-between w-full sm:items-center gap-2">
                <Button
                  variant={"outline"}
                  className="bg-transparent dark text-xs sm:text-sm"
                  onClick={handleUploadClick}
                >
                  <span className="hidden sm:inline">
                    Upload Code as a File
                  </span>
                  <span className="sm:hidden">Upload Code</span>
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={"secondary"}
                    className="dark text-xs sm:text-sm"
                    onClick={handleRun}
                    disabled={isLoading}
                  >
                    {isLoading ? "Running..." : "Run Tests"}
                  </Button>
                  <Button
                    className="text-white bg-green-500 hover:bg-green-700 text-xs sm:text-sm"
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
