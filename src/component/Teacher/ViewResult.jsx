import React, { useState, useEffect } from "react";
import NavBar from "./TeacherNavbar";
import axios from "axios";

const ViewResult = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const [tableData, setTableData] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const username = localStorage.getItem("username");

        if (!token || !username) {
          throw new Error("User is not logged in");
        }

        const response = await axios.get(
          `http://localhost:5070/onlineExam/get-examnames/${username}`,
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
          console.error("Error fetching exam names:", err);
        }
      }
    };
    fetchExams();
  }, []);

  const handleSubmit = async () => {
    if (selectedValue) {
      try {
        const token = localStorage.getItem("jwtToken");

        if (!token) {
          throw new Error("User is not logged in");
        }

        const response = await axios.get(
          `http://localhost:5070/onlineExam/result/${selectedValue}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Store the API response in tableData
        setTableData(response.data);
      } catch (err) {
        console.error("Error fetching results:", err);
        setTableData([]);
      }
    } else {
      setTableData([]);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-screen-2xl bg-gray-50 p-6 mt-20">
      <NavBar />
      {/* Dropdown and Submit Section */}
      <div className="flex items-center space-x-4 mb-8">
        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          <option value="">Select an exam</option>
          {exams.map((exam, index) => (
            <option key={index} value={exam}>
              {exam}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
        >
          Submit
        </button>
      </div>

      {/* Table Section */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-x-auto">
        {tableData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No data</div>
        ) : (
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 border border-gray-200 text-left text-gray-600 font-medium min-w-[100px]">
                  Exam ID
                </th>
                <th className="px-6 py-3 border border-gray-200 text-left text-gray-600 font-medium min-w-[150px]">
                  Exam Name
                </th>
                <th className="px-6 py-3 border border-gray-200 text-left text-gray-600 font-medium min-w-[138px]">
                  Total Time (in minutes)
                </th>
                <th className="px-6 py-3 border border-gray-200 text-left text-gray-600 font-medium min-w-[90px]">
                 Marks
                </th>
                <th className="px-6 py-3 border border-gray-200 text-left text-gray-600 font-medium min-w-[90px]">
                 Total Marks
                </th>
                <th className="px-6 py-3 border border-gray-200 text-left text-gray-600 font-medium min-w-[150px]">
                  Candidate Name
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition-colors duration-200"
                >
                  <td className="px-6 py-4 border border-gray-200">{row[0]}</td>
                  <td className="px-6 py-4 border border-gray-200">{row[1]}</td>
                  <td className="px-6 py-4 border border-gray-200">{row[4]}</td>
                  <td className="px-6 py-4 border border-gray-200">{row[5]}</td>
                  <td className="px-6 py-4 border border-gray-200">{row[6]}</td>
                  <td className="px-6 py-4 border border-gray-200">{row[7]}</td>
                  <td className="px-6 py-4 border border-gray-200">{row[8]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewResult;
