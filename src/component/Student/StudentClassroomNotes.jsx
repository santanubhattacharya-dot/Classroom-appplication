import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FiPlus } from "react-icons/fi"; // Import plus icon
import Modal from "react-modal"; // Import react-modal
import NavBar from "../Teacher/TeacherNavbar";
import StudentNavBar from "./StudentNavbarV2";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { Tooltip } from "@mui/material";
import { GrNotes } from "react-icons/gr";

const StudentClassroomNotes = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // State to store uploaded files
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [isNavBarOpen, setIsNavBarOpen] = useState(false); // State to track navbar open/close
  const { classroomId } = useParams(); // Retrieve classroomId from URL param
  const [studentCount,setStudentCount]=useState(0);
 
  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Fetch the list of uploaded files
  const fetchUploadedFiles = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(
        `http://localhost:5070/onlineExam/files/${classroomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to the request header
          },
        }
      );
      setUploadedFiles(response.data); // Update the state with the list of files
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };
//fetches the student count from the db of a particular class by its class code 
  const fetchStudentCount=async()=>{
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(
        `http://localhost:5070/onlineExam/get-count/${classroomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to the request header
          },
        }
      );
      setStudentCount(response.data); // Update the state with the list of files
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }

  }

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }
    console.log("class id:", classroomId);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        `http://localhost:5070/onlineExam/upload/${classroomId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("File uploaded successfully.");
      setSelectedFile(null); // Clear selected file
      fetchUploadedFiles(); // Fetch updated list of files after uploading
      setIsModalOpen(false); // Close the modal after uploading
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file.");
    }
  };

  // Fetch uploaded files when component mounts
  useEffect(() => {
    fetchUploadedFiles();
    fetchStudentCount();
  }, [classroomId]);

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Callback to handle NavBar open/close state
  const handleNavBarToggle = (isOpen) => {
    setIsNavBarOpen(isOpen);
  };

  return (
    <div className="relative min-h-screen bg-white transition-all duration-300">
      {/* Navbar with toggle functionality */}
      <StudentNavBar onToggle={handleNavBarToggle} isNavBarOpen={isNavBarOpen} />

      {/* Main content area, adjusting its width based on sidebar state */}
      <div
        className={` pt-16 p-6 transition-all duration-300 ${
          isNavBarOpen ? "ml-36" : "ml-16"
        }`} 
      >
        {/* Display list of uploaded files */}
        <div className="flex items-center center justify-between">
        <div className="flex items-center center space-x-2 ">
        <GrNotes className="h-6 w-6 text-green-500 mt-5 "/>
        <h3 className="text-lg font-semibold mt-6">Uploaded Files</h3>
        </div>

        <div className="flex items-center">
        <Tooltip title="Students"  placement="bottom">
        <div>
        <MdOutlinePeopleAlt className="h-6 w-6 text-green-500 mt-5 " />
        </div>
        </Tooltip>
        <div className="mt-4 text-yellow-700"> {studentCount}</div>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2  lg:grid-cols-3 gap-4 mt-4">
          {uploadedFiles.length > 0 ? (
            uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <h4 className="text-sm font-medium text-black">{file}</h4>
                <a
                  href={`http://localhost:5070/onlineExam/download/${classroomId}_${file}`}
                  className="text-green-500 mt-2 inline-block"
                  download
                >
                  Download
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No files uploaded yet.</p>
          )}
        </div>

        
      </div>

     
    </div>
  );
};

export default StudentClassroomNotes;
