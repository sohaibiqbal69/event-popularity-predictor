import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError } from '../utils';
import { handleSuccess } from '../utils';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

function Login({ setIsAuthenticated }) {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e)=> {
        const {name, value} = e.target;
        console.log(name, value);
        const copyLoginInfo = {...loginInfo};
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        const { email, password } = loginInfo;
        if(!email || !password) {
            return handleError('Both fields are mandatory.')
        }
        try {
            const url = "http://localhost:8080/auth/login"
            const response = await fetch(url, {
                method: "POST",
                headers:{
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            console.log('Login response:', result);
            const { success, message, jwtToken, name, error } = result;
            if(success){
                console.log('Login successful, storing token...');
                handleSuccess(message);
                
                // Store the token without Bearer prefix
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                
                // Set authentication state
                setIsAuthenticated(true);
                
                // Notify token change
                window.dispatchEvent(new Event('tokenChanged'));
                
                // Use navigate for redirection
                navigate('/home', { replace: true });
            } else if(error){
                const details = error?.details[0].message;
                handleError(details);
            } else if(!success) {
                handleError(message);
            }
        } catch (err) {
            console.error('Login error:', err);
            handleError('Failed to login. Please try again.');
        }
    }

    return (
        <div className='container'>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input 
                        onChange={handleChange}
                        type="email" 
                        name="email" 
                        placeholder='Enter your email...'
                        value={loginInfo.email}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input 
                        onChange={handleChange}
                        type="password" 
                        name="password" 
                        placeholder='Enter your password...'
                        value={loginInfo.password}
                    />
                </div>
                <button type='submit'>Login</button>
                <span>Don't have an account?
                    <Link to="/signup"> Sign-Up!</Link>
                </span>
            </form>
            <ToastContainer />
        </div>
    )
}

export default Login