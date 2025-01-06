import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiList } from "react-icons/fi"; // Import the icon for "Show Exams"
import { RxHamburgerMenu } from "react-icons/rx";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { LuLayoutDashboard } from "react-icons/lu";
import { FiPlusCircle } from "react-icons/fi";
import Tooltip from "@mui/material/Tooltip";
import { IoAlarmOutline } from "react-icons/io5";
import { TbNotes } from "react-icons/tb";

const NavBar = ({ onDrawerToggle, isDrawerOpen }) => {
  const [isOpen, setIsOpen] = useState(isDrawerOpen);
  const navigate = useNavigate();

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  // Toggle Drawer State
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    onDrawerToggle(!isOpen); // Notify parent component about drawer state change
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-white p-4 flex justify-between items-center shadow-md fixed top-0 left-0 right-0 z-50">
        {/* Hamburger Menu */}
        <Tooltip title="Menu" arrow placement="right">
          <div className="text-gray-800 cursor-pointer" onClick={toggleDrawer}>
            <RxHamburgerMenu className="h-6 w-6 text-green-500" />
          </div>
        </Tooltip>

        {/* Logout Button */}
        <Tooltip title="Log out" arrow>
          <div className="text-gray-800 cursor-pointer" onClick={handleLogout}>
            <RiLogoutCircleRLine className="h-6 w-6 text-green-500" />
          </div>
        </Tooltip>
      </nav>

      {/* Sliding Drawer */}
      <div
        className={`fixed top-12 left-0 h-full bg-white  text-black shadow-lg p-2 z-40 transition-width duration-400 ease-in-out ${
          isOpen ? "w-40" : "w-16"
        }`}
      >
        {/* Drawer Content */}
        <div className="flex items-center space-x-2 p-2">
          {/* Dashboard Icon */}
          <Tooltip title="Dashboard" arrow placement="right">
            <div>
              <LuLayoutDashboard className="text-green-500 size-6" />
            </div>
          </Tooltip>
          {/* Dashboard Label */}
          <Link
            to="/dashboard"
            className={`text-base ${
              isOpen ? "inline-block" : "hidden"
            } whitespace-nowrap`}
            style={{ minWidth: isOpen ? "100px" : "0" }}
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center space-x-2 p-2">
          {/* Create Exam Icon */}
          <Tooltip title="Create Exam" arrow placement="right">
            <div>
              <FiPlusCircle className="text-green-500 size-6" />
            </div>
          </Tooltip>
          {/* Create Exam Label */}
          <Link
            to="/create-exam"
            className={`text-base ${
              isOpen ? "inline-block" : "hidden"
            } whitespace-nowrap`}
            style={{ minWidth: isOpen ? "100px" : "0" }}
          >
            Create Exam
          </Link>
        </div>

        {/* Show Exams Section */}
        <div className="flex items-center space-x-2 p-2">
          {/* Show Exams Icon */}
          <Tooltip title="Show Exams" arrow placement="right">
            <div>
              <IoAlarmOutline className="text-green-500 size-6" />
              {/* React Icons added here */}
            </div>
          </Tooltip>
          {/* Show Exams Label */}
          <Link
            to="/show-exams"
            className={`text-base ${
              isOpen ? "inline-block" : "hidden"
            } whitespace-nowrap`}
            style={{ minWidth: isOpen ? "100px" : "0" }}
          >
            Show Exams
          </Link>
        </div>
        
        {/*result Section */}
        <div className="flex items-center space-x-2 p-2">
          {/* Show Exams Icon */}
          <Tooltip title="View Results" arrow placement="right">
            <div>
              <TbNotes className="text-green-500 size-6" />{" "}
              {/* React Icons added here */}
            </div>
          </Tooltip>
          {/* Show Exams Label */}
          <div>
            <Link
              to="/view-result"
              className={`text-base ${
                isOpen ? "inline-block" : "hidden"
              } whitespace-nowrap`}
              style={{ minWidth: isOpen ? "100px" : "0" }}
            >
              View Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
