import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from "react-redux";
import rootReducer from './reducer';
import {configureStore} from "@reduxjs/toolkit";
import {Toaster} from "react-hot-toast";
const store= configureStore({
    reducer:rootReducer,
});
const root = createRoot(document.getElementById('root'));

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
            <Toaster />
        </BrowserRouter>
    </Provider>
);
