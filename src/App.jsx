// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";



// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import VerifyPassword from "./components/auth/VerifyPassword.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import ChangePassword from "./components/auth/ChangePassword.jsx";


// Admin imports
import Layout from "./components/admin/Layout.jsx";
import AdminHome from "./components/pages/admin/Home.jsx";
import Users from "./components/pages/admin/Users.jsx";
import CreateUser from "./components/pages/admin/CreateNewUser.jsx";
import EditUsers from "./components/pages/admin/EditUsers.jsx";


import UserLayout from "./components/user/Layout.jsx"
import Admin_Manage_Irrigation_predictions from "./components/pages/admin/IrrigationPredictions.jsx";
import UserPredictions from "./components/pages/user/IrrigationPredictions.jsx";
import AdminProfile from "./components/pages/admin/AdminProfile.jsx";
import UserProfile from "./components/pages/user/UserProfile.jsx";
import UserHome from "./components/pages/user/Home.jsx";





const App = () => {
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in",
      delay: 100,
    });

    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-black dark:text-white text-black overflow-x-hidden">
      <BrowserRouter>
        <Routes>
          {/* Home view */}
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/verifypassword" element={<VerifyPassword />} />
          <Route path="/passwordreset" element={<ResetPassword />} />
          <Route path="/changePassword" element={<ChangePassword />} />

          {/* End Home view */}

          {/* Admin */}

          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminHome />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/edituser/:id" element={<EditUsers />} />
            <Route path="/admin/createUser/" element={<CreateUser />} />

            <Route path="/admin/predictions" element={<Admin_Manage_Irrigation_predictions />} />
            <Route path="/admin/profile/:id" element={<AdminProfile />} />

          </Route>


          {/* user */}

          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserHome />} />
            <Route path="/user/predictions" element={<UserPredictions />} />
            <Route path="/user/profile/:id" element={<UserProfile />} />
     
          </Route>




        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
