import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { useNavigate } from "react-router-dom";

function Register() {

    const backendURL = "https://inventory-webapp-backend.railway.internal";
    const navigate = useNavigate();
    const initialValues = {
        username: "",
        email: "",
        password: "",
    };
    
    const validationSchema = Yup.object().shape({
        username: Yup.string().required(),
        email: Yup.string().email().required(),
        password: Yup.string().required().min(5),
    });

    const onSubmit = async (data) => {
        var redirect = false;
        await axios.post(`${backendURL}/register`, data).then((response) => {
            if (response.data.username === data.username) redirect = true;
            else alert(response.data);
        });
        if (redirect) navigate("/login");
    }

    return (
        <div className="grid w-full">
            <div className="grid w-full justify-center">
                Register Page
            </div>
            <div className="grid w-full justify-center">
                <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                    <Form className="grid w-96 gap-2 border-2 border-slate-500 rounded-md p-2 m-1">
                        <label className="font-sans text-sm">Username:</label>
                        <ErrorMessage className="text-xs text-red-500" name="username" component="span" />
                        <Field className="border-2 border-slate-500 rounded-sm" id="usernameField" name="username" placeholder="Your username ..." />
                        <label className="font-sans text-sm">Email:</label>
                        <ErrorMessage className="text-xs text-red-500" name="email" component="span" /> 
                        <Field className="border-2 border-slate-500 rounded-sm" id="emailField" name="email" placeholder="Your email ..." />
                        <label className="font-sans text-sm">Password:</label>
                        <ErrorMessage className="text-xs text-red-500" name="password" component="span" /> 
                        <Field className="border-2 border-slate-500 rounded-sm" id="passwordField" name="password" placeholder="Your password ..." />
                        <button className="bg-slate-400 rounded-md hover:bg-slate-500 active:bg-slate-600" type="submit">Log In</button>
                    </Form>
                </Formik>
            </div>
        </div>
    )
}

export default Register
