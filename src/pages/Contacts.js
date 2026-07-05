import React from 'react'
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function Contacts() {

    const backendURL = "https://inventory-webapp-backend.railway.internal";
    const navigate = useNavigate();
    const [listOfContacts, setListOfContacts] = useState([]);
    
    const [addContactVisible, setAddContactVisible] = useState(false);
    const [editContactVisible, setEditContactVisible] = useState(false);
    
    const initialValues = {
        name: "",
        kind: "Client",
        email: "",
        address: "",
    };
    
    const [editValues, setEditValues] = useState({
        id: null,
        name: "",
        kind: "",
        email: "",
        address: "",
    });
    
    const validationSchema = Yup.object().shape({
        name: Yup.string().required(),
        kind: Yup.string().required(),
        email: Yup.string().email().required(),
        address: Yup.string().required(),
    });
    
    const onSubmitNew = async (data) => {
        try {
            await axios.post(`${backendURL}/contacts`, data, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
                if (response.data.name === data.name) {
                    var newContacts = listOfContacts;
                    newContacts.push(response.data);
                    setListOfContacts(newContacts);
                    setAddContactVisible(false);
                } else {
                    alert(response.data);
                }
            });
        } catch (error) {
            alert(`Server error ${error}, review your input`);
        }
    }
    
    const onSubmitEdit = async (data) => {
        try {
            await axios.put(`${backendURL}/contacts`, data, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
                if (response.data.id === data.id) {
                    const newContacts = listOfContacts.map(contact => contact.id === data.id ? data : contact)
                    setListOfContacts(newContacts);
                    setEditContactVisible(false);
                } else {
                    alert(response.data);
                }
            });
        } catch (error) {
            alert(`Server error ${error}, review your input`);
        }
    }
    
    const editContact = (value) => {
        setEditValues(value);
        setEditContactVisible(true);
    }
    
    const deleteContact = async (data) => {
        if(window.confirm("Confirm deletion!")) {
            try {
                await axios.delete(`${backendURL}/contacts/${data.id}`, { headers: { accessToken: localStorage.getItem("accessToken") }, }).then((response) => {
                    if (response.data == data.id) {
                        const newContacts = listOfContacts.filter((contact) => contact.id !== data.id);
                        setListOfContacts(newContacts);
                    } else {
                        alert(response.data);
                    }
                });
            } catch (error) {
                alert(`Server error ${error}, review your input`);
            }
        }
    }
    
    useEffect(() => {
        axios.get(`${backendURL}/contacts`, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
            if (response.data.error) navigate("/login");
            else setListOfContacts(response.data);
        })
    }, []);
    
    const listContacts = listOfContacts.map((value, key) => 
        <tr key={key} class="hover:bg-cyan-200 *:border-collapse *:border-slate-300 border-slate-300 border-b-2 *:border-r-2 *:rounded-xl">
            <td>{value.name}</td>
            <td>{value.kind}</td>
            <td>{value.email}</td>
            <td>{value.address}</td>
            <td class="cursor-pointer hover:bg-cyan-300 text-center border-none" onClick={() => editContact(value)}>Edit</td>
            <td class="cursor-pointer hover:bg-cyan-300 text-center border-none" onClick={() => deleteContact(value)}>Delete</td>
        </tr>
    );
    
    
    return (
        <div class="flex justify-between w-full h-full">
            <div class="flex items-start p-1">
                {!addContactVisible && 
                    <button onClick={() => { setAddContactVisible(true); }} className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1">
                        Add New Contact
                    </button>
                }
                {addContactVisible && 
                    <Formik initialValues={initialValues} onSubmit={onSubmitNew} validationSchema={validationSchema}>
                        <Form className="grid gap-2 border-2 border-slate-500 rounded-md p-2 m-1">
                            <button className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1" type="submit">
                                Add Contact
                            </button>
                            <button onClick={() => { setAddContactVisible(false); }} className="bg-red-400 rounded-md hover:bg-red-500 active:bg-red-600 border-2 border-slate-400 p-1">
                                Cancel
                            </button>
                            <label className="font-sans text-sm">Contact name:</label>
                            <ErrorMessage className="text-xs text-red-500" name="name" component="span" />
                            <Field className="border-2 border-slate-500 rounded-sm" id="nameField" name="name" placeholder="Contact name ..." />
                            <label className="font-sans text-sm">Kind:</label>
                            <ErrorMessage className="text-xs text-red-500" name="kind" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="kindField" name="kind" as="select">
                                <option value="Client">Client</option>
                                <option value="Supplier">Supplier</option>
                            </Field>
                            <label className="font-sans text-sm">Email:</label>
                            <ErrorMessage className="text-xs text-red-500" name="email" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="emailField" name="email" placeholder="Your email address ..." />
                            <label className="font-sans text-sm">Address:</label>
                            <ErrorMessage className="text-xs text-red-500" name="address" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="addressField" name="address" placeholder="Your billing or shipping address ..." />
                        </Form>
                   </Formik>
                }
            </div>
            <div class="flex items-center w-2/3 p-1 rounded-xl shadow-lg outline outline-black/5">
                <table class="table w-full bg-cyan-100 rounded-xl">
                    <thead>
                        <tr class="border-b-2 border-collapse border-slate-300">
                            <th class="rounded-md">Contact name</th>
                            <th class="rounded-md">Kind</th>
                            <th class="rounded-md">Email</th>
                            <th class="rounded-md">Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listContacts}
                    </tbody>
                </table>
            </div>
            <div class="flex items-start p-1">
                {editContactVisible && 
                    <Formik initialValues={editValues} onSubmit={onSubmitEdit} validationSchema={validationSchema} enableReinitialize={true}>
                        <Form className="grid gap-2 border-2 border-slate-500 rounded-md p-2 m-1">
                            <button className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1" type="submit">
                                Save changes
                            </button>
                            <button onClick={() => { setEditContactVisible(false); }} className="bg-red-400 rounded-md hover:bg-red-500 active:bg-red-600 border-2 border-slate-400 p-1">
                                Cancel
                            </button>
                            <label className="font-sans text-sm">Contact name:</label>
                            <ErrorMessage className="text-xs text-red-500" name="name" component="span" />
                            <Field className="border-2 border-slate-500 rounded-sm" id="nameField" name="name" placeholder="Contact name ..." />
                            <label className="font-sans text-sm">Kind:</label>
                            <ErrorMessage className="text-xs text-red-500" name="kind" component="span" />
                            <Field className="border-2 border-slate-500 rounded-sm" id="kindField" name="kind" as="select">
                                <option value="Client">Client</option>
                                <option value="Supplier">Supplier</option>
                            </Field>
                            <label className="font-sans text-sm">Email:</label>
                            <ErrorMessage className="text-xs text-red-500" name="email" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="emailField" name="email" placeholder="Your email address ..." />
                            <label className="font-sans text-sm">Address:</label>
                            <ErrorMessage className="text-xs text-red-500" name="address" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="addressField" name="address" placeholder="Your billing or shipping address ..." />
                        </Form>
                   </Formik>
                }
            </div>
        </div>
    )
}

export default Contacts
