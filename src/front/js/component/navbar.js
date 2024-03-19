import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Login } from "../component/Login";
import Logo from "../../img/logo-color.png"
import KPDLogo from "../../img/KPD-Logo.png"
import KPDtransparent from "../../img/KPD-Transparent.png"


export const Navbar = (props) => {
	const [loggedIn, setLoggedIn] = useState(props.logState);
	const [pressedLogIn, setPressedLogin] = useState(false);

	const [show, setShow] = useState(props.logState);

	const logout = () => {
		sessionStorage.clear();
		setLoggedIn(false);
		props.updateLogState(false)

	}

	const handleClose = () => setShow(false);
	const handleShow = () => {
		setShow(true);
		console.log(loggedIn)
	
	};
	
	useEffect(()=>{
		sessionStorage.getItem("id")?
		setLoggedIn(true):
		setLoggedIn(false)
		
	})
	
	return (
		(loggedIn) ? 	
		
		<nav className="navbar navbar-expand-lg navbar-dark shadow-5-strong " style={{border: "none"}}>
			<a className="navbar-brand ms-3" href="/"><img  src={KPDtransparent}/></a>
		
			<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span className="navbar-toggler-icon"></span>
			</button>
			

			{/* <div className="collapse navbar-collapse" id="navbarSupportedContent">
				<ul className="navbar-nav mr-auto">
					<li className="nav-item active">
						<a className="nav-link" href="#"><img></img> <span className="sr-only">(current)</span></a>
					</li>
					<li className="nav-item">
						<a className="nav-link" href="#">Link</a>
					</li>
					<li className="nav-item dropdown">
						<a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Dropdown
						</a>
						<div className="dropdown-menu" aria-labelledby="navbarDropdown">
						<a className="dropdown-item" href="#">Action</a>
						<a className="dropdown-item" href="#">Another action</a>
						<div className="dropdown-divider"></div>
						<a className="dropdown-item" href="#">Something else here</a>
						</div>
					</li>
					<li className="nav-item">
						<a className="nav-link disabled" href="#">Disabled</a>
					</li>
				</ul> */}
				<form className="form-inline my-2 my-lg-0 ms-auto me-1">
					<Link to="/">
						<button className="btn btn-outline-success my-2 my-sm-0" type="button" onClick={(logout)}>Log Out</button>
                    </Link>
					
				</form>
			
		</nav>
		:	
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-5-strong d-flex" style={{border: "none"}}>
			<a className="navbar-brand ms-3" href="/"><img  src={KPDLogo}/></a>
		
			<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span className="navbar-toggler-icon"></span>
			</button>
			
			<div className="collapse navbar-collapse " id="navbarSupportedContent">
				

				<ul className="navbar-nav ms-auto">

					<li className= "nav-item ms-auto">
						<a className="nav-link" href="#products">Products</a>
					</li>
					<li className="nav-item ms-auto">
						{/* trigger event to pop up log in */}
						<a className="nav-link" href="#" onClick={((show)? handleClose:handleShow)}>Login</a>
						{(show === true)?
						<Login logState ={loggedIn} updateLogState={setLoggedIn} />: ""
}
					</li>
					<li className="nav-item ms-auto">
					{/* <Link to={`/account/${sessionStorage.getItem("id")}`}>
					
					</Link> */}
						<a className="nav-link" href="/signup">Signup</a>
					</li>
				</ul>
			</div>
		</nav>
	);
};

