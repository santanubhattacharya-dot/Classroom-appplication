import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import NavBar from "./StudentNavbar";
import StudentNavBar from "./StudentNavbarV2";

const StudentDashboard = () => {
  const [assignedExams, setAssignedExams] = useState([]);
  const [examDetails, setExamDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedExams = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const uid = localStorage.getItem("username");

        // Fetch student full name
        const response = await axios.get(`http://localhost:5070/onlineExam/fullname/${uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudentId(response.data);

        // Fetch exam IDs
        const examResponse = await axios.get(`http://localhost:5070/onlineExam/getexamId/${response.data}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const examIds = examResponse.data;
        setAssignedExams(examIds);

        // Fetch exam details for each exam
        const examDetailsPromises = examIds.map(async (examId) => {
          const detailsResponse = await axios.get(`http://localhost:5070/onlineExam/examdetails/${examId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Accessing the correct examId (3rd element in the array)
          return { examId: detailsResponse.data[0][2], examName: detailsResponse.data[0][0] };
        });

        const exams = await Promise.all(examDetailsPromises);
        setExamDetails(exams);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching assigned exams:", err);
        setError("Failed to load assigned exams");
        setLoading(false);
        navigate("/")
      }
    };

    fetchAssignedExams();
  }, []);

  if (loading) {
    return <p>Loading exams...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleExamClick = (examId,examName) => {
    navigate(`/exam/${examId}/${encodeURIComponent(examName)}/${studentId}`);
  };

  return (
    <div className="min-h-screen bg-white ml-14 mt-12">
      <StudentNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {examDetails.length === 0 ? (
          <p className="text-gray-500 text-lg text-center mt-8">No upcoming exams.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {examDetails.map((exam, index) => (
              <div
                key={index}
                className="bg-gray-50 shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 p-6 flex items-center cursor-pointer "
                onClick={() => handleExamClick(exam.examId,exam.examName)}
              >
                <FiPlay className=" font-normal text-3xl mr-6" />
                <div>
                  <h3 className="text-lg font-medium  text-stone-600">{exam.examName}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
