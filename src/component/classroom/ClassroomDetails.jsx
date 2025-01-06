import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../Teacher/TeacherNavbar";
import { FaPlus } from "react-icons/fa"; // Import FaPlus icon
import { useNavigate } from "react-router-dom";


const ClassroomDetails = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State to track sidebar
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for creating classroom
  const [classroomName, setClassroomName] = useState(""); // Store the classroom name input
  const navigate = useNavigate();

  // Fetch username from local storage
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("jwtToken");

        const response = await axios.get(
          `http://localhost:5070/onlineExam/classroom-details/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClassrooms(response.data);
      } catch (error) {
        console.error("Error fetching classroom details:", error);
      }
    };

    fetchClassrooms();
  }, [username,classroomName]);

  // Handle sidebar toggle
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
    <div className="relative min-h-screen bg-white">
      {/* Navbar with drawer toggle */}
      <NavBar onDrawerToggle={handleDrawerToggle} isDrawerOpen={isDrawerOpen} />

      {/* Adjust the main content padding and margins based on sidebar state */}
      <div
        className={`pt-16 p-6 ml-16`}>
        <h2 className="text-2xl font-semibold mb-6 text-blue-600">
          Your Classrooms
        </h2>

        {/* Grid layout for classroom cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {classrooms.length > 0 ? (
            classrooms.map((classroom, index) => (
              <div
                key={index} onClick={() => navigate(`/classroom/${classroom[0]}/notes`)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-lg font-bold text-indigo-500">
                  {classroom[1]}
                </h3>
                <p className="text-gray-600 mt-2">Class Code: {classroom[0]}</p>
              
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-4 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No classrooms available.</p>
            </div>
          )}
        </div>

        {/* Floating plus icon for creating a classroom */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-green-400  text-black p-4 rounded-full  hover:bg-green-500 focus:outline-none"
        >
          <FaPlus size={24} />
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
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
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

export default ClassroomDetails;
