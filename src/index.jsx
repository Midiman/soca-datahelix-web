import React from 'react'
import { CookiesProvider } from 'react-cookie';
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastContainer } from 'react-toastify';
import './scss/styles.scss';

import { ThemeContextProvider } from '@hct/soca-toolkit';


ReactDOM.createRoot(document.getElementById('root')).render(
    <>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            pauseOnHover
            closeOnClick
            hideProgressBar
        />
        <CookiesProvider defaultSetOptions={{ path: '/' }}>
            <ThemeContextProvider>
                <App />
            </ThemeContextProvider>
        </CookiesProvider>
    </>
)
