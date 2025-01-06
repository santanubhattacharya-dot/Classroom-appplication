import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import SignUp from './component/SignUp';
import StudentDashboard from './component/Student/StudentDashboard';
import TeacherDashboard from './component/Teacher/TeacherDashboard';
import CreateExam from './component/Teacher/CreateExam';
import CreateExamStepper from './component/Teacher/CreateExam';
import ExamComponent from './component/Student/ExamComponent';
import ClassroomDetails from './component/classroom/ClassroomDetails';
import ClassroomNotes from './component/classroom/ClassroomNotes';
import StudentClasses from './component/Student/StudentClasses';
import StudentClassroomNotes from './component/Student/StudentClassroomNotes';
import ResultComponent from './component/Student/ResultComponent';
import ViewResult from './component/Teacher/ViewResult';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/teacher-dashboard" element={<ClassroomDetails/>}/>
        <Route path="/create-exam" element={<CreateExamStepper/>}/>
        <Route path="/dashboard" element={<ClassroomDetails/>}/>
        <Route path="/student-dashboard" element={<StudentClasses/>}/>
        <Route path="/exam/:examId/:examName/:studentId" element={<ExamComponent/>}/>
        <Route path="/show-exams" element={<TeacherDashboard/>}/>
        <Route path="/classroom/:classroomId/notes" element={<ClassroomNotes/>} />
        <Route path="/studentclassroom/:classroomId/notes" element={<StudentClassroomNotes/>} />
        <Route path="/exams" element={<StudentDashboard/>}/>
        <Route path="/exam-result/:marks/:questions"  element={<ResultComponent/>}/>
        <Route path="/view-result" element={<ViewResult/>}/>
      </Routes>
    </Router>
  );
}

export default App;
