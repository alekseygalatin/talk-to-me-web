import React, { useEffect, useState } from 'react';
import './App.css';
import VoiceRecorder from './VoiceRecorder';
import { jwtDecode } from 'jwt-decode';

const clientId = '7o8tqlt2ucihqsbtthfopc9d4p';
const redirectUri = 'https://d3u8od6g4wwl6c.cloudfront.net'; // Replace with your S3 URL
const tokenUrl = 'https://talk-to-me.auth.us-east-1.amazoncognito.com/oauth2/token';

interface JwtPayload {
    exp: number; // Expiration time
}

const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check for token in localStorage
        const storedToken = localStorage.getItem('idToken');
        if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
            setLoading(false);
        } else {
            handleCallback(); // Handles the callback if code is present
        }
    }, []);

    // Function to redirect user to Cognito login
    const redirectToLogin = () => {
        const loginUrl = `https://talk-to-me.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
        window.location.href = loginUrl;
    };

    // Function to handle callback and retrieve token
    const handleCallback = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Exchange code for tokens
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    code: code,
                }),
            });

            if (response.ok) {
                const tokens = await response.json();
                const idToken = tokens.id_token;
                localStorage.setItem('idToken', idToken);
                setToken(idToken);
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                console.error('Token exchange failed:', await response.text());
                redirectToLogin();
            }
        } else {
            redirectToLogin();
        }
        setLoading(false);
    };

    // Helper function to check if token is expired
    const isTokenExpired = (token: string) => {
        const decoded: JwtPayload = jwtDecode(token);
        return decoded.exp * 1000 < Date.now();
    };

    useEffect(() => {
        // Check for token expiration periodically and refresh if necessary
        const interval = setInterval(() => {
            const storedToken = localStorage.getItem('idToken');
            if (storedToken && isTokenExpired(storedToken)) {
                redirectToLogin(); // Redirect to login if token is expired
            }
        }, 5 * 60 * 1000); // Check every 5 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="App">
            {loading ? (
                <p>Loading...</p>
            ) : token ? (
                <VoiceRecorder token={token} />
            ) : (
                <p>Please log in to access the Voice Recorder.</p>
            )}
        </div>
    );
};

export default App;
