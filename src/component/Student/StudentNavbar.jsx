import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiLogOut } from "react-icons/fi"; // Using react-icon for the logout icon

const NavBar = () => {
  const [studentId, setStudentId] = useState(""); // Store student name
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const uid = localStorage.getItem("username");

        // Fetch student's full name using username
        const response = await axios.get(`http://localhost:5070/onlineExam/fullname/${uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudentId(response.data); // Set student name
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudent();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  return (
    <div>
      <nav className="bg-white h-16 p-4 flex justify-between items-center shadow-sm border-b-2 border-gray-200 fixed top-0 left-0 right-0 z-50">
        {/* Good Luck Message with Student Name */}
        <div className="text-indigo-950 text-xl font-medium tracking-wider">
          {studentId ? `Good Luck, ${studentId}!` : "Good Luck!"}
        </div>

        {/* Logout Button */}
        <div
          className="flex items-center h-9 space-x-2 bg-gray-100 text-gray-800 cursor-pointer p-2 rounded-lg shadow-lg hover:outline hover:outline-2 hover:outline-indigo-500 transition duration-300"
          onClick={handleLogout}
          style={{
            boxShadow:
              "8px 8px 16px #bebebe, -8px -8px 16px #ffffff", // Neomorphic effect
          }}
        >
          <FiLogOut className="w-4 h-4" /> {/* Reduced the size of the logout icon */}
          <span className="text-lg font-semibold text-indigo-950">Logout</span>
        </div>
      </nav>
      {/* Space between the navbar and the dashboard content */}
      <div className="h-20"></div> {/* Added space below the navbar */}
    </div>
  );
};

export default NavBar;
