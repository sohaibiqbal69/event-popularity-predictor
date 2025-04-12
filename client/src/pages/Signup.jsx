import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError } from '../utils';
import { handleSuccess } from '../utils';
import './Login.css';

function Signup() {
    
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    })

    const navigate = useNavigate();

    const handleChange = (e)=> {
        const {name, value} = e.target;
        console.log(name, value);
        const copySignupInfo = {...signupInfo};
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        const { name, email, password } = signupInfo;
        if(!name || !email || !password) {
            return handleError('All fields are madatory.')
        }
        try {
            const url = "http://localhost:8080/auth/signup"
            const response = await fetch(url, {
                method: "POST",
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if(success){
                handleSuccess(message);
                setTimeout(()=>{
                    navigate('/login')
                }, 1000)
            } else if(error){
                const details = error?.details[0].message;
                handleError(details);
            } else if(!success) {
                handleError(message);
            }
            console.log(result);
        } catch (err) {
            handleError(err);
        }
    }

    // Add event listener for form switcher
    useEffect(() => {
        const switchers = [...document.querySelectorAll('.switcher')];
        
        switchers.forEach(item => {
            item.addEventListener('click', function() {
                switchers.forEach(item => item.parentElement.classList.remove('is-active'));
                this.parentElement.classList.add('is-active');
            });
        });

        // Clean up event listeners on component unmount
        return () => {
            switchers.forEach(item => {
                item.removeEventListener('click', function() {
                    switchers.forEach(item => item.parentElement.classList.remove('is-active'));
                    this.parentElement.classList.add('is-active');
                });
            });
        };
    }, []);

    return (
        <section className="forms-section">
            <h1 className="section-title">Login & Signup</h1>
            <div className="forms">
                <div className="form-wrapper">
                    <button type="button" className="switcher switcher-login">
                        Login
                        <span className="underline"></span>
                    </button>
                    <form className="form form-login" onSubmit={(e) => {
                        e.preventDefault();
                        navigate('/login');
                    }}>
                        <fieldset>
                            <legend>Please, enter your email and password for login.</legend>
                            <div className="input-block">
                                <label htmlFor="login-email">E-mail</label>
                                <input id="login-email" type="email" placeholder="Enter your email..." required />
                            </div>
                            <div className="input-block">
                                <label htmlFor="login-password">Password</label>
                                <input id="login-password" type="password" placeholder="Enter your password..." required />
                            </div>
                        </fieldset>
                        <button type="submit" className="btn-login">Login</button>
                    </form>
                </div>
                <div className="form-wrapper is-active">
                    <button type="button" className="switcher switcher-signup">
                        Sign Up
                        <span className="underline"></span>
                    </button>
                    <form className="form form-signup" onSubmit={handleSignup}>
                        <fieldset>
                            <legend>Please, enter your email, password and password confirmation for sign up.</legend>
                            <div className="input-block">
                                <label htmlFor="signup-username">Username</label>
                                <input 
                                    id="signup-username" 
                                    type="text" 
                                    name="name"
                                    value={signupInfo.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name..." 
                                    required 
                                />
                            </div>
                            <div className="input-block">
                                <label htmlFor="signup-email">E-mail</label>
                                <input 
                                    id="signup-email" 
                                    type="email" 
                                    name="email"
                                    value={signupInfo.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email..." 
                                    required 
                                />
                            </div>
                            <div className="input-block">
                                <label htmlFor="signup-password">Password</label>
                                <input 
                                    id="signup-password" 
                                    type="password" 
                                    name="password"
                                    value={signupInfo.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password..." 
                                    required 
                                />
                            </div>
                        </fieldset>
                        <button type="submit" className="btn-signup">Sign Up</button>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </section>
    )
}

export default Signup