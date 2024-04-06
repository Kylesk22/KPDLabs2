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
import Orb from "../../front/img/image.png";



//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    
    const [loggedIn, setLoggedIn] = useState(false)

    return (
        
        <div 
        // style={{
        //     backgroundImage:`url(${Orb})`, backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "100%, 100%, contain", height: "80%"}}
            >
         {/* background: `linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url(${Orb})`, height: "40%", marginTop: "40px"}}> */}
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    {/* <Navbar logState ={loggedIn} updateLogState={setLoggedIn}/> */}
                    <Routes>
                        {/* <Route element={<Demo />} path="/demo" />
                        <Route element={<Single />} path="/single/:theid" /> */}
                        <Route element={<Home logState ={loggedIn} updateLogState={setLoggedIn}/>} path="/" />
                        <Route element={<UserPage logState ={loggedIn} updateLogState={setLoggedIn}/>} path="/account/:user_id" />
                        <Route element={<Signup logState ={loggedIn} updateLogState={setLoggedIn}/>} path="/signup" />
                        <Route element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
