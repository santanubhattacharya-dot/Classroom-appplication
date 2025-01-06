import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiList } from "react-icons/fi"; // Import the icon for "Show Exams"
import { LuLayoutDashboard } from "react-icons/lu";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx";
import Tooltip from "@mui/material/Tooltip";
import { IoAlarmOutline } from "react-icons/io5";


const StudentNavBar = ({ onDrawerToggle, isDrawerOpen }) => {
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
      <nav className="bg-white  p-4 flex justify-between items-center shadow-md fixed top-0 left-0 right-0 z-50">
        {/* Hamburger Menu */}
        <Tooltip title="Menu" arrow placement="right">
        <div className="text-black cursor-pointer" onClick={toggleDrawer}>
          <RxHamburgerMenu className="h-6 w-6 text-green-500" />
        </div>
        </Tooltip>
        {/* Logout Button */}
        <Tooltip title="Log out" arrow>
          <div className="text-gray-400 cursor-pointer" onClick={handleLogout}>
            <RiLogoutCircleRLine className="h-6 w-6 text-green-500" />
          </div>
        </Tooltip>
      </nav>

      {/* Sliding Drawer */}
      <div
        className={`fixed top-12 left-0 h-full bg-white text-black shadow-lg p-2 z-40 transition-width duration-400 ease-in-out ${
          isOpen ? "w-40" : "w-16"
        }`}
      >
        {/* Drawer Content */}

        <div className="flex items-center space-x-2 p-2">
          <Tooltip title="Dashboard" arrow placement="right">
            <div>
              <LuLayoutDashboard className="text-green-500 size-6" />
            </div>
          </Tooltip>
          {/* Dashboard Label */}
          <div>
            <Link
              to="/student-dashboard"
              className={`text-base ${
                isOpen ? "inline-block" : "hidden"
              } whitespace-nowrap`}
              style={{ minWidth: isOpen ? "100px" : "0" }}
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Show Exams Section */}
        <div className="flex items-center space-x-2 p-2">
          {/* Show Exams Icon */}
          <Tooltip title="Show Exams" arrow placement="right">
          <div>
          <IoAlarmOutline className="text-green-500 size-6" />{" "}
            {/* React Icons added here */}
          </div>
          </Tooltip>
          {/* Show Exams Label */}
          <div>
            <Link
              to="/exams"
              className={`text-base ${
                isOpen ? "inline-block" : "hidden"
              } whitespace-nowrap`}
              style={{ minWidth: isOpen ? "100px" : "0" }}
            >
              Show Exams
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentNavBar;
