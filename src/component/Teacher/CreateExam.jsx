import React, { useState, useEffect } from "react";
import { Stepper, Step, StepLabel, Button } from "@mui/material";
import axios from "axios";
import NavBar from "./TeacherNavbar";

const CreateExamStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [examName, setExamName] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answers: "" },
  ]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]); // For classroom dropdown
  const [selectedClassroom, setSelectedClassroom] = useState(""); // To store selected classroom
  const [availableStudents, setAvailableStudents] = useState([]); // Students for selected classroom
  const [studentName, setStudentName] = useState([]); // Usernames of students in classroom
  const [totalTime, setTotalTime] = useState(""); // Add this state for total time

  const creator = localStorage.getItem("username");

  // Fetch classrooms created by the logged-in user
  useEffect(() => {
    if (activeStep === 1) {
      axios
        .get(`http://localhost:5070/onlineExam/classroom-details/${creator}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        })
        .then((response) => setClassrooms(response.data))
        .catch((error) => console.error("Error fetching classrooms:", error));
    }
  }, [activeStep, creator]);

  // Fetch students for the selected classroom
  const fetchStudentsForClassroom = (classroomId) => {
    axios
      .get(`http://localhost:5070/onlineExam/studentnames/${classroomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((response) => {
        setStudentName(response.data); // Set usernames in studentName state
        console.log("username",studentName)
        // For each username, call the studentlist API to get the full name
        const fullNamesPromises = response.data.map((username) =>
          axios.get(
            `http://localhost:5070/onlineExam/studentlist/${username}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              },
            }
          )
        );
        return Promise.all(fullNamesPromises);
      })
      .then((fullNamesResponses) => {
        // Extract full names from the responses and update availableStudents
        const fullNames = fullNamesResponses.map((response) => response.data);
        setAvailableStudents(fullNames);
        console.log("fullname:",availableStudents)
      })
      .catch((error) =>
        console.error("Error fetching students or full names:", error)
      );
  };

  // Handle classroom selection from the dropdown
  const handleClassroomChange = (e) => {
    const selectedClass = e.target.value;
    setSelectedClassroom(selectedClass);
    console.log('Classroom : ',selectedClass);
    // Fetch students based on the selected classroom
    fetchStudentsForClassroom(selectedClass);
  };

  // Handle student selection (from the second dropdown)
  const handleStudentSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedStudents(selectedOptions);
  };

  // Handle input change for exam name
  const handleExamNameChange = (e) => {
    setExamName(e.target.value);
  };

  // Handle question text and options change
  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  // Handle correct answer input
  const handleAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].answers = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answers: "" },
    ]);
  };

  // Submit form
  const handleSubmit = async (e) => {
   e.preventDefault();
    const classroomName =selectedClassroom;
    console.log("first classromm name:",classroomName);
    const examData = {
      examName,
      totalTime,
      questions,
      creator,
      assignedStudents: selectedStudents,
      classroomName,
    };
    console.log("2nd classromm name:",classroomName);
    console.log("examData name:",examData);
    try {
      await axios.post(
        "http://localhost:5070/onlineExam/create-exam",
        examData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
       alert("Exam created and assigned successfully");
    } catch (error) {
      console.error(
        "Error creating exam:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div>
            <div className="mb-4">
              <label className="block mb-2 text-lg font-semibold">
                Exam Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={handleExamNameChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-lg font-semibold">
                Total Time (in minutes)
              </label>
              <input
                type="number"
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
                min={3}
              />
            </div>

            {questions.map((question, qIndex) => (
              <div key={qIndex} className="mb-6">
                <label className="block mb-2 text-lg font-semibold">
                  Question {qIndex + 1}
                </label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-4"
                  placeholder="Enter question"
                  required
                />
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="mb-2">
                    <label className="block mb-2">Option {optIndex + 1}</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(qIndex, optIndex, e.target.value)
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder={`Enter option ${optIndex + 1}`}
                      required
                    />
                  </div>
                ))}
                <label className="block mb-2">Correct Answer</label>
                <input
                  type="text"
                  value={question.answers}
                  onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter correct answer"
                  required
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Add Question
            </button>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Select Classroom and Students
            </h2>

            {/* Classroom dropdown */}
            <label className="block mb-2">Select Classroom</label>
            <select
              value={selectedClassroom}
              onChange={handleClassroomChange}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            >
              <option value="">-- Select Classroom --</option>
              {classrooms.map((classroom, index) => (
                <option key={index} value={classroom[0]}>
                  {classroom[1]}
                </option>
              ))}
            </select>

            {/* Student dropdown */}
            <label className="block mb-2">Select Students</label>
            <select
              multiple
              value={selectedStudents}
              onChange={handleStudentSelection}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {availableStudents.map((student, index) => (
                <option key={index} value={student}>
                  {student}
                </option>
              ))}
            </select>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
            <p>
              <strong>Exam Name:</strong> {examName}
            </p>
            <p>
              <strong>Created By:</strong> {creator}
            </p>
            <p>
              <strong>Questions:</strong>
            </p>
            <ul>
              {questions.map((q, index) => (
                <li key={index}>
                  {q.question} - {q.options.join(", ")} (Answer: {q.answers})
                </li>
              ))}
            </ul>
            <p>
              <strong>Assigned Students:</strong> {selectedStudents.join(", ")}
            </p>
            <button
              onClick={handleSubmit}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Submit Exam
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 mt-12 ml-12">
      <NavBar />
      <Stepper activeStep={activeStep} alternativeLabel>
        {["Create Exam", "Select Classroom & Students", "Review & Submit"].map(
          (label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          )
        )}
      </Stepper>
      <div className="mt-8">
        {getStepContent(activeStep)}
        <div className="mt-4">
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>
          )}
          {activeStep < 2 && (
            <Button onClick={() => setActiveStep(activeStep + 1)}>Next</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateExamStepper;
