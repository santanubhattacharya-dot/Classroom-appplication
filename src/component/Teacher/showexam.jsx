import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation
import NavBar from "./TeacherNavbar";
import { FaEye, FaTrash, FaPlus } from "react-icons/fa"; // Import FaPlus icon for creating a classroom
import moment from "moment";

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [questionDetails, setQuestionDetails] = useState([]); // Store questions
  const [questionOptions, setQuestionOptions] = useState({}); // Store options for each question
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // Sidebar state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for creating classroom
  const [classroomName, setClassroomName] = useState(""); // Store the classroom name input
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const username = localStorage.getItem("username");

        if (!token || !username) {
          throw new Error("User is not logged in");
        }

        const response = await axios.get(
          `http://localhost:5070/onlineExam/teacher/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExams(response.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          console.error("You are not authorized to access this resource.");
        } else {
          console.error("Error fetching exams:", err);
        }
      }
    };

    fetchExams();
  }, [navigate]);

  // View exam details and fetch questions + options, and generate PDF
  const handleViewDetails = async (exam) => {
    try {
      setQuestionDetails([]);
      setQuestionOptions({});

      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(
        `http://localhost:5070/onlineExam/examdetails/${exam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const examDetails = response.data;

      const questionResponse = await axios.get(
        `http://localhost:5070/onlineExam/questionsdetails/${exam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const questions = questionResponse.data;

      const optionsPromises = questions.map((question) =>
        fetchQuestionOptions(question[1])
      );

      const allOptions = await Promise.all(optionsPromises);
      const optionsMap = {};
      questions.forEach((question, index) => {
        optionsMap[question[1]] = allOptions[index];
      });

      generatePDF(examDetails, questions, optionsMap);

      setQuestionDetails(questions);
      setQuestionOptions(optionsMap);
    } catch (error) {
      console.error("Error fetching exam details:", error);
    }
  };

  const fetchQuestionOptions = async (questionId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(
        `http://localhost:5070/onlineExam/options/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching options for question ${questionId}:`, error);
      return [];
    }
  };

  // Generate PDF containing exam details
  const generatePDF = (examDetails, questions, optionsMap) => {
    if (!examDetails || questions.length === 0) {
      console.error("Exam details or questions are not available.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Exam Name: ${examDetails[0][0]}`, 10, 10);
    doc.setFontSize(12);
    doc.text(
      `Created at: ${moment(examDetails[0][1]).format(
        "MMMM Do YYYY, h:mm:ss"
      )}`,
      10, 20
    );

    let yOffset = 30;

    questions.forEach((question, index) => {
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${question[0]}`, 10, yOffset);

      yOffset += 10;

      const options = optionsMap[question[1]];
      if (options && options.length > 0) {
        options.forEach((option, idx) => {
          doc.setFontSize(12);
          doc.text(`${String.fromCharCode(65 + idx)}. ${option}`, 20, yOffset);
          yOffset += 10;
        });
      } else {
        doc.text("No options available for this question.", 20, yOffset);
        yOffset += 8;
      }

      yOffset += 8;

      if (yOffset > 270) {
        doc.addPage();
        yOffset = 10;
      }
    });

    doc.save(`${examDetails[0][0]}-details.pdf`);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        const token = localStorage.getItem("jwtToken");
        await axios.delete(
          `http://localhost:5070/onlineExam/deleteexam/${examId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExams(exams.filter((exam) => exam[1] !== examId));
      } catch (error) {
        console.error("Error deleting exam:", error);
      }
    }
  };

  const handleDrawerToggle = (isOpen) => {
    setIsDrawerOpen(isOpen);
  };

  // Handle create classroom
  const handleCreateClassroom = async () => {
    if (!classroomName.trim()) {
      alert("Please enter a classroom name.");
      return;
    }

    const classCode = Math.random().toString(36).substr(2, 8); // Generate random code
    const username = localStorage.getItem("username");

    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        "http://localhost:5070/onlineExam/createclassroom",
        {
          classroomName,
          classCode,
          createdBy: username,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`Classroom "${classroomName}" created successfully with code ${classCode}`);
      setIsModalOpen(false);
      setClassroomName("");
    } catch (error) {
      console.error("Error creating classroom:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-200">
      <NavBar onDrawerToggle={handleDrawerToggle} isDrawerOpen={isDrawerOpen} />

      {/* Adjust the main content margin based on sidebar collapse state */}
      <div
        className={`pt-16 p-6 transition-all duration-300 ${
          isDrawerOpen ? "ml-36" : "ml-12"
        }`}
      >
        <h2 className="text-xl font-semibold mb-2 text-blue-700">Exams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-2 gap-4">
          {exams.length > 0 ? (
            exams.map((exam, index) => (
              <div
                key={index}
                className="relative bg-white p-4 rounded-lg shadow-lg text-center group cursor-pointer"
              >
                <h3 className="text-lg font-bold text-emerald-500">{exam[0]}</h3>

                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <div className="flex space-x-4">
                    <FaEye
                      className="text-white text-2xl cursor-pointer"
                      onClick={() => handleViewDetails(exam[1])}
                    />
                    <FaTrash
                      className="text-white text-2xl cursor-pointer"
                      onClick={() => handleDeleteExam(exam[1])}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-48 bg-white p-4 rounded-lg shadow-lg">
              <p className="text-gray-600">No exam is created</p>
            </div>
          )}
        </div>

        {/* Floating plus icon for creating a classroom */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
        >
          <FaPlus className="text-2xl" />
        </button>
      </div>

      {/* Modal for creating a classroom */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Create Classroom</h2>
            <input
              type="text"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
              placeholder="Enter classroom name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={handleCreateClassroom}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-2 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
