import React, { useContext } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../helpers/AuthContext'

function Login() {

    const backendURL = "http://inventory-webapp-backend.railway.internal:8080";
    const { setAuthState } = useContext(AuthContext);
    const navigate = useNavigate();
    const initialValues = {
        email: "",
        password: "",
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required().min(5),
    });

    const onSubmit = async (data) => {
        await axios.post(`${backendURL}/login`, data).then((response) => {
            if (response.data.error) alert(response.data.error);
            else {
                localStorage.setItem("accessToken", response.data.token);
                setAuthState({
                    username: response.data.username,
                    id: response.data.id,
                    status: true,
                });
                navigate("/");
            }
        });
    }

    return (
        <div className="grid w-full">
            <div className="grid w-full justify-center">
                Login Page
            </div>
            <div className="grid w-full justify-center">
                <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                    <Form className="grid w-96 gap-2 border-2 border-slate-500 rounded-md p-2 m-1">
                        <label className="font-sans text-sm">Email:</label>
                        <ErrorMessage className="text-xs text-red-500" name="email" component="span" /> 
                        <Field className="border-2 border-slate-500 rounded-sm" id="emailField" name="email" placeholder="Your email ..." />
                        <label className="font-sans text-sm">Password:</label>
                        <ErrorMessage className="text-xs text-red-500" name="password" component="span" /> 
                        <Field className="border-2 border-slate-500 rounded-sm" id="passwordField" name="password" type="password" placeholder="Your password ..." />
                        <button className="bg-slate-400 rounded-md hover:bg-slate-500 active:bg-slate-600" type="submit">Log In</button>
                    </Form>
                </Formik>
            </div>
        </div>
    )
}

export default Login
