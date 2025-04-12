import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError } from '../utils';
import { handleSuccess } from '../utils';
import logo from '../assets/logo.png';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

function Login({ setIsAuthenticated }) {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('All fields are mandatory.');
        }
        try {
            const url = "http://localhost:8080/auth/login";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setIsAuthenticated(true);
                window.dispatchEvent(new Event('tokenChanged'));
                navigate('/home', { replace: true });
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            console.error('Login error:', err);
            handleError('Failed to login. Please try again.');
        }
    }

    useEffect(() => {
        const switchers = [...document.querySelectorAll('.switcher')];
        
        switchers.forEach(item => {
            item.addEventListener('click', function() {
                switchers.forEach(item => item.parentElement.classList.remove('is-active'));
                this.parentElement.classList.add('is-active');
            });
        });

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
            <div className="branding">
                <img src={logo} alt="Event Sage Logo" className="logo" />
                <h1 className="brand-title">Event Sage</h1>
                <p className="brand-tagline">Predict Your Event's Success</p>
            </div>
            <div className="forms">
                <div className="form-wrapper is-active">
                    <button type="button" className="switcher switcher-login">
                        Login
                        <span className="underline"></span>
                    </button>
                    <form className="form form-login" onSubmit={handleLogin}>
                        <fieldset>
                            <legend>Please, enter your email and password for login.</legend>
                            <div className="input-block">
                                <label htmlFor="login-email">E-mail</label>
                                <input 
                                    id="login-email" 
                                    type="email" 
                                    name="email"
                                    value={loginInfo.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-block">
                                <label htmlFor="login-password">Password</label>
                                <input 
                                    id="login-password" 
                                    type="password" 
                                    name="password"
                                    value={loginInfo.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </fieldset>
                        <button type="submit" className="btn-login">Login</button>
                    </form>
                </div>
                <div className="form-wrapper">
                    <button type="button" className="switcher switcher-signup">
                        Sign Up
                        <span className="underline"></span>
                    </button>
                    <form className="form form-signup" onSubmit={(e) => {
                        e.preventDefault();
                        navigate('/signup');
                    }}>
                        <fieldset>
                            <legend>Please, enter your email, password and password confirmation for sign up.</legend>
                            <div className="input-block">
                                <label htmlFor="signup-username">Username</label>
                                <input id="signup-username" type="text" required />
                            </div>
                            <div className="input-block">
                                <label htmlFor="signup-email">E-mail</label>
                                <input id="signup-email" type="email" required />
                            </div>
                            <div className="input-block">
                                <label htmlFor="signup-password">Password</label>
                                <input id="signup-password" type="password" required />
                            </div>
                        </fieldset>
                        <button type="submit" className="btn-signup">Sign Up</button>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </section>
    );
}

export default Login;