"use client";

import { useState, useEffect } from "react";
import { fetchData } from "@/utils/api";
export default function QuestionsManagementPage() {
  // State for managing questions
  const [apiQuestions, setApiQuestions] = useState<ApiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);

  // Question form state
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: "",
    title: "",
    description: "",
    difficulty: "easy", // Default difficulty value
    sampleInputs: ["", "", ""],
    sampleOutputs: ["", "", ""],
    testInputs: ["", "", "", ""],
    testOutputs: ["", "", "", ""],
    createdAt: "",
  });

  // Load questions on component mount
  useEffect(() => {
    const checkAdmin = async () => {
      const res = await fetchData("is_admin/", "POST", null, false, false);
      if (res.is_admin == true) {
        loadQuestions();
      } else {
        window.location.href = "/admin/login";
      }
    };

    checkAdmin();
  }, []);
  // Load questions from API
  const loadQuestions = async () => {
    setLoading(true);

    try {
      const response = await fetchData("get_questions/", "POST", null, false,false);
      if (response.questions === undefined) {
        // console.log("not admin");
        window.location.href = "/admin/login";
      }

      if (response && response.questions) {
        setApiQuestions(response.questions);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new question or update existing question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formMode === "edit") {
        await handleUpdateQuestion();
      } else {
        // Validate form
        if (!newQuestion.title || !newQuestion.description) {
          alert("Please fill in title and description");
          return;
        }

        const postData = {
          title: newQuestion.title,
          description: newQuestion.description,
          difficulty: newQuestion.difficulty,
          samples: {
            input: newQuestion.sampleInputs,
            output: newQuestion.sampleOutputs,
          },
          tests: {
            input: newQuestion.testInputs,
            output: newQuestion.testOutputs,
          },
        };

        await fetchData("add_question/", "POST", postData, false, false);

        // Reload questions from API
        await loadQuestions();

        // Reset form
        handleResetForm();

        // Close form
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Failed to save question");
    }
  };

  // Edit a question - prepare form for editing
  const handleEditQuestion = async (questionNumber: number) => {
    try {
      // Fetch complete question details
      const response = await fetchData(
        "get_question/",
        "POST",
        { question_number: questionNumber },
        false,
        false
      );

      if (response) {
        // Populate form with fetched data
        setNewQuestion({
          id: response.question_id.toString(),
          title: response.title,
          description: response.description,
          difficulty: response.difficulty || "easy",
          sampleInputs: response.samples.input,
          sampleOutputs: response.samples.output,
          testInputs: response.tests.input,
          testOutputs: response.tests.output,
          createdAt: new Date().toISOString(),
        });

        setFormMode("edit");
        setEditQuestionId(response.question_id.toString());
        setShowForm(true);
      }
    } catch (error) {
      console.error("Error fetching question details:", error);
      alert("Failed to load question details");
    }
  };

  // Handle updating an existing question
  const handleUpdateQuestion = async () => {
    try {
      if (!newQuestion.title || !newQuestion.description) {
        alert("Please fill in title and description");
        return;
      }

      const questionNumber = apiQuestions.find(
        (q) => q.question_id.toString() === editQuestionId
      )?.question_number;

      if (!questionNumber) {
        alert("Question number not found");
        return;
      }

      const updateData = {
        question_number: questionNumber,
        title: newQuestion.title,
        description: newQuestion.description,
        difficulty: newQuestion.difficulty,
        samples: {
          input: newQuestion.sampleInputs,
          output: newQuestion.sampleOutputs,
        },
        tests: {
          input: newQuestion.testInputs,
          output: newQuestion.testOutputs,
        },
      };

      await fetchData("update_question/", "POST", updateData, false, false);

      // Reload questions after update
      await loadQuestions();

      // Reset form
      handleResetForm();

      // Close form
      setShowForm(false);
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Failed to update question");
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle array input changes (for samples and tests)
  const handleArrayChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    field: "sampleInputs" | "sampleOutputs" | "testInputs" | "testOutputs",
    index: number
  ) => {
    const { value } = e.target;
    setNewQuestion((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return {
        ...prev,
        [field]: updatedArray,
      };
    });
  };

  // Reset the form and prepare for adding new question
  const handleAddNewClick = () => {
    handleResetForm();
    setFormMode("add");
    setEditQuestionId(null);
    setShowForm(true);
  };

  // Reset the form
  const handleResetForm = () => {
    setNewQuestion({
      id: "",
      title: "",
      description: "",
      difficulty: "easy", // Reset to default difficulty
      sampleInputs: ["", "", ""],
      sampleOutputs: ["", "", ""],
      testInputs: ["", "", "", ""],
      testOutputs: ["", "", "", ""],
      createdAt: "",
    });
  };

  // Cancel form editing/adding
  const handleCancelForm = () => {
    handleResetForm();
    setShowForm(false);
  };

  return (
    <div className="question-manager">
      <h1>Question Manager</h1>

      {/* Question list or question form */}
      {!showForm ? (
        <div className="question-list-container">
          <button className="add-btn" onClick={handleAddNewClick}>
            Add New Question
          </button>

          {/* API Questions list */}
          <div className="question-list">
            <h2>Questions</h2>
            {loading ? (
              <p>Loading questions...</p>
            ) : apiQuestions.length === 0 ? (
              <p>No questions found. Add a question to get started.</p>
            ) : (
              <ul>
                {apiQuestions.map((question) => (
                  <li key={question.question_id} className="question-item">
                    <div className="question-title">
                      {question.question_number}. {question.question}
                    </div>
                    <div className="question-actions">
                      <button
                        className="edit-btn"
                        onClick={() =>
                          handleEditQuestion(question.question_number)
                        }
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        /* Question Form (Add/Edit) */
        <div className="question-form">
          <h2>{formMode === "add" ? "Add New Question" : "Edit Question"}</h2>
          <form onSubmit={handleSubmitQuestion}>
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newQuestion.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={newQuestion.description}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </div>

            {/* Difficulty Dropdown */}
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty:</label>
              <select
                id="difficulty"
                name="difficulty"
                value={newQuestion.difficulty}
                className="text-white bg-[#121418]"
                onChange={handleInputChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Sample Test Cases */}
            <div className="form-section">
              <h3>Sample Test Cases</h3>
              {[0, 1, 2].map((index) => (
                <div key={`sample-${index}`} className="test-case">
                  <div className="form-group">
                    <label>Sample Input {index + 1}:</label>
                    <textarea
                      value={newQuestion.sampleInputs[index]}
                      onChange={(e) =>
                        handleArrayChange(e, "sampleInputs", index)
                      }
                      rows={2}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Sample Output {index + 1}:</label>
                    <textarea
                      value={newQuestion.sampleOutputs[index]}
                      onChange={(e) =>
                        handleArrayChange(e, "sampleOutputs", index)
                      }
                      rows={2}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Test Cases (Hidden) */}
            <div className="form-section">
              <h3>Test Cases (Hidden)</h3>
              {[0, 1, 2, 3].map((index) => (
                <div key={`test-${index}`} className="test-case">
                  <div className="form-group">
                    <label>Test Input {index + 1}:</label>
                    <textarea
                      value={newQuestion.testInputs[index]}
                      onChange={(e) =>
                        handleArrayChange(e, "testInputs", index)
                      }
                      rows={2}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Test Output {index + 1}:</label>
                    <textarea
                      value={newQuestion.testOutputs[index]}
                      onChange={(e) =>
                        handleArrayChange(e, "testOutputs", index)
                      }
                      rows={2}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Form Buttons */}
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {formMode === "add" ? "Add Question" : "Update Question"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Type for API response question
interface ApiQuestion {
  question: string;
  question_number: number;
  question_id: number;
}

// Type for a question
interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard"; // Add the difficulty property
  sampleInputs: string[];
  sampleOutputs: string[];
  testInputs: string[];
  testOutputs: string[];
  createdAt: string;
}
