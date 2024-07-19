import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";

import { Home } from "./pages/home";

import { Single } from "./pages/single";
import injectContext from "./store/appContext";


import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import { Signup } from "./pages/Signup";
import { UserPage } from "./pages/UserPage";
import { Login } from "./component/Login";
import { Forgot } from "./pages/Forgot";
import{AboutUs} from "./pages/AboutUs";
import{ContactUs} from "./pages/ContactUs";
import {AdminLogin} from "./component/AdminLogin"
import {AdminPage} from "./pages/AdminPage"
import {AdminSingleCase} from "./pages/AdminSingleCase"
import{Crown} from "./pages/Crown";
import{Veneer} from "./pages/Veneer";
import{Partial} from "./pages/Partial";
import{Denture} from "./pages/Denture";
import {Blogs} from "./pages/Blogs";
import {Blog1} from "./pages/Blog1";
import {Blog2} from "./pages/Blog2";
import {Terms} from "./pages/Terms";


import Orb from "../../front/img/image.png";



//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    
    const [loggedIn, setLoggedIn] = useState(false)
    const [mobileActive, setMobileActive] = useState(false)
    const [userPage, setUserPage] = useState("home")

    useEffect(()=>{
        console.log(loggedIn)
    })
    return (
        
        <div 
        style={{overflowX: "hidden"}}
        // style={{
        //     backgroundImage:`url(${Orb})`, backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "100%, 100%, contain", height: "80%"}}
            >
         {/* background: `linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url(${Orb})`, height: "40%", marginTop: "40px"}}> */}
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar setUserPage = {setUserPage} movbileActive={mobileActive} setMobileActive={setMobileActive} logState ={loggedIn} updateLogState={setLoggedIn}/>
                    <Routes>
                        {/* <Route element={<Demo />} path="/demo" />
                        <Route element={<Single />} path="/single/:theid" /> */}
                        <Route element={<Home logState ={loggedIn} updateLogState={setLoggedIn}/>} path="/" />
                        <Route element={<UserPage userPage={userPage} logState ={loggedIn} updateLogState={setLoggedIn}/>} path="/account/:user_id" />
                        <Route element={<Signup logState ={loggedIn} updateLogState={setLoggedIn}/>} path="/signup" />
                        <Route element={<AboutUs/>} path = "/aboutus"/>
                        <Route element={<ContactUs/>} path = "/contactus"/>
                        <Route element={<Crown/>} path = "/crownandbridge"/>
                        <Route element={<Veneer/>} path = "/veneer"/>
                        <Route element={<Partial/>} path = "/partial"/>
                        <Route element={<Denture/>} path = "/denture"/>
                        <Route element={<Login logState ={loggedIn} updateLogState={setLoggedIn}/> } path = "/login"/>
                        <Route element={<Forgot /> } path = "/forgot"/>
                        <Route element={<AdminLogin /> } path = "/admin/login"/>
                        <Route element={<AdminPage /> } path = "/admin/:user_id"/>
                        <Route element={<AdminSingleCase /> } path = "/admin/:user_id/:case_id"/>
                        <Route element={<Blogs /> } path = "/blogs"/>
                        <Route element={<Blog1 />  } path = "/blogs/blog1"/>
                        <Route element={<Blog2 />  } path = "/blogs/blog2"/>
                        <Route element={<Terms /> } path = "/terms"/>
                        
                        
                        <Route element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
