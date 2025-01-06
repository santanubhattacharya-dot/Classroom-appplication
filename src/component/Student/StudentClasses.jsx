import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus } from "react-icons/fi"; // Plus icon for joining new classes
import Modal from "react-modal"; // Import react-modal for the popup
import StudentNavBar from "./StudentNavbarV2";
import { useNavigate } from "react-router-dom";
import { SiGoogleclassroom } from "react-icons/si";
import { FaPeopleRoof } from "react-icons/fa6";

// Modal styles
const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const StudentClasses = () => {
  const [className, setclassName] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const username = localStorage.getItem("username"); // Fetch username from localStorage
  const token = localStorage.getItem("jwtToken");
  const [codes, setCodes] = useState([]);
  const navigate = useNavigate();
  const [fullname, setFullName] = useState("");
  // Fetch the already joined classes for the student
  const fetchJoinedClasses = async () => {
    try {
      // Fetch the class codes first
      const response = await axios.get(`http://localhost:5070/onlineExam/get-classcode/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to the request header
        },
      });
      const classCodesFromApi = response.data;
      setCodes(classCodesFromApi); // Set the codes state
      console.log("Class codes fetched:", classCodesFromApi);

      let allClasses = []; // Temporary array to hold all class data

      // Loop through each class code and fetch joined classes
      for (const classCode of classCodesFromApi) {
        const classesResponse = await axios.get(`http://localhost:5070/onlineExam/joined-classes/${classCode}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to the request header
          },
        });
        allClasses = [...allClasses, ...classesResponse.data]; // Add fetched classes to the array
      }

      setclassName(allClasses); // Set the aggregated classes in state
    } catch (error) {
      console.error("Error fetching joined classes:", error);
    }
  };

  // Handle class code submission
  const handleJoinClass = async () => {
    if (!classCode) {
      alert("Please enter a class code.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5070/onlineExam/join-class", // Change this to the actual API endpoint
        {
          classCode, // Send classCode
          username, // Send username from local storage
          fullname,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Successfully joined the class!");
      setIsModalOpen(false); // Close the modal
      setClassCode(""); // Clear input
      fetchJoinedClasses(); // Refetch the classes after joining
    } catch (error) {
      console.error("Error joining the class:", error);
      alert("Failed to join the class.");
    }
  };

  // Open/close modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const fetchStudentFullName = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const uid = localStorage.getItem("username");

      // Fetch student full name
      const response = await axios.get(`http://localhost:5070/onlineExam/fullname/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFullName(response.data);
    }catch (err) {
      console.error("Error fetching student full  name:", err);
  
    }

  }


  // Fetch joined classes when component mounts
  useEffect(() => {
    fetchJoinedClasses();
    fetchStudentFullName();
  }, []);

  return (
    <div className="relative min-h-screen bg-white p-6 ml-14 mt-12">
      {/* Header */}
      <StudentNavBar />
      <div className="flex items-center space-x-2">
      <FaPeopleRoof className="h-6 w-6 text-green-500"/>
      <h2 className="text-2xl mt-6 mb-6 text-black font-medium">My Classes</h2>
      </div>
      
      {/* Display list of joined classes */}
      {className.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {className.map((classItem, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 shadow-md rounded-lg hover:shadow-xl transition-shadow duration-300"
              onClick={() => navigate(`/studentclassroom/${codes[index]}/notes`)}
            >
              <h3 className="text-lg font-semibold text-black">{classItem[0]}</h3>
              <p className="text-sm text-gray-400 mt-2">Teacher: {classItem[1]}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-stone-500">You haven't joined any classes yet.</p>
      )}

      {/* Plus Icon for joining new classes */}
      <div className="fixed bottom-8 right-8">
        <button
          className="bg-green-400 text-black rounded-full p-4 shadow-lg hover:bg-green-500 focus:outline-none"
          onClick={toggleModal} // Open modal on click
        >
          <FiPlus size={24} />
        </button>
      </div>

      {/* Modal for entering class code */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        style={customModalStyles}
        contentLabel="Join Class"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 "
      >
        <h2 className="text-xl font-semibold mb-4">Join a New Class</h2>
        <input
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          placeholder="Enter class code"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <div className="flex items-center space-x-4 ml-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 h-10 w-20"
            onClick={handleJoinClass} // Call join class logic
          >
            Join
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={toggleModal} // Close modal
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentClasses;
