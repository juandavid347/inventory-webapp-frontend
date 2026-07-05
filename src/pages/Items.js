import React from 'react'
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function Items() {

    const backendURL = "https://inventory-webapp-backend-production.up.railway.app";
    const navigate = useNavigate();
    const [listOfItems, setListOfItems] = useState([]);
    
    const [addItemVisible, setAddItemVisible] = useState(false);
    const [editItemVisible, setEditItemVisible] = useState(false);
    
    const initialValues = {
        name: "",
        description: "",
        quantity: "",
        price: "",
    };
    
    const [editValues, setEditValues] = useState({
        id: null,
        name: "",
        description: "",
        quantity: "",
        price: "",
    });
    
    const validationSchema = Yup.object().shape({
        name: Yup.string().required(),
        description: Yup.string().required(),
        quantity: Yup.number().positive().required(),
        price: Yup.number().positive().required(),
    });
    
    const onSubmitNew = async (data) => {
        try {
            await axios.post(`${backendURL}/items`, data, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
                if (response.data.name === data.name) {
                    var newItems = listOfItems;
                    newItems.push(response.data);
                    setListOfItems(newItems);
                    setAddItemVisible(false);
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
            await axios.put(`${backendURL}/items`, data, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
                if (response.data.id === data.id) {
                    const newItems = listOfItems.map(item => item.id === data.id ? data : item)
                    setListOfItems(newItems);
                    setEditItemVisible(false);
                } else {
                    alert(response.data);
                }
            });
        } catch (error) {
            alert(`Server error ${error}, review your input`);
        }
    }
    
    const editItem = (value) => {
        setEditValues(value);
        setEditItemVisible(true);
    }
    
    const deleteItem = async (data) => {
        if(window.confirm("Confirm deletion!")) {
            try {
                await axios.delete(`${backendURL}/items/${data.id}`, { headers: { accessToken: localStorage.getItem("accessToken") }, }).then((response) => {
                    if (response.data == data.id) {
                        const newItems = listOfItems.filter((item) => item.id !== data.id);
                        setListOfItems(newItems);
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
        axios.get(`${backendURL}/items`, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
            if (response.data.error) navigate("/login");
            else setListOfItems(response.data);
        })
    }, []);
    
    const listItems = listOfItems.map((value, key) => 
        <tr key={key} class="hover:bg-cyan-200 *:border-collapse *:border-slate-300 border-slate-300 border-b-2 *:border-r-2 *:rounded-xl">
            <td>{value.name}</td>
            <td>{value.description}</td>
            <td>{value.quantity}</td>
            <td>{value.price}</td>
            <td class="cursor-pointer hover:bg-cyan-300 text-center border-none" onClick={() => editItem(value)}>Edit</td>
            <td class="cursor-pointer hover:bg-cyan-300 text-center border-none" onClick={() => deleteItem(value)}>Delete</td>
        </tr>
    );
    
    
    return (
        <div class="flex justify-between w-full h-full">
            <div class="flex items-start p-1">
                {!addItemVisible && 
                    <button onClick={() => { setAddItemVisible(true); }} className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1">
                        Add New Item
                    </button>
                }
                {addItemVisible && 
                    <Formik initialValues={initialValues} onSubmit={onSubmitNew} validationSchema={validationSchema}>
                        <Form className="grid gap-2 border-2 border-slate-500 rounded-md p-2 m-1">
                            <button className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1" type="submit">
                                Add Item
                            </button>
                            <button onClick={() => { setAddItemVisible(false); }} className="bg-red-400 rounded-md hover:bg-red-500 active:bg-red-600 border-2 border-slate-400 p-1">
                                Cancel
                            </button>
                            <label className="font-sans text-sm">Item name:</label>
                            <ErrorMessage className="text-xs text-red-500" name="name" component="span" />
                            <Field className="border-2 border-slate-500 rounded-sm" id="nameField" name="name" placeholder="Name your item ..." />
                            <label className="font-sans text-sm">Description:</label>
                            <ErrorMessage className="text-xs text-red-500" name="description" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="descriptionField" name="description" placeholder="Describe your item ..." />
                            <label className="font-sans text-sm">Quantity:</label>
                            <ErrorMessage className="text-xs text-red-500" name="quantity" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="quantityField" name="quantity" placeholder="How many items ..." />
                            <label className="font-sans text-sm">Price:</label>
                            <ErrorMessage className="text-xs text-red-500" name="price" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="priceField" name="price" placeholder="How much it each one costs ..." />
                        </Form>
                   </Formik>
                }
            </div>
            <div class="flex items-center w-2/3 p-1 rounded-xl shadow-lg outline outline-black/5">
                <table class="table w-full bg-cyan-100 rounded-xl">
                    <thead>
                        <tr class="border-b-2 border-collapse border-slate-300">
                            <th class="rounded-md">Item</th>
                            <th class="rounded-md">Description</th>
                            <th class="rounded-md">Quantity</th>
                            <th class="rounded-md">Price($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listItems}
                    </tbody>
                </table>
            </div>
            <div class="flex items-start p-1">
                {editItemVisible && 
                    <Formik initialValues={editValues} onSubmit={onSubmitEdit} validationSchema={validationSchema} enableReinitialize={true}>
                        <Form className="grid gap-2 border-2 border-slate-500 rounded-md p-2 m-1">
                            <button className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1" type="submit">
                                Save changes
                            </button>
                            <button onClick={() => { setEditItemVisible(false); }} className="bg-red-400 rounded-md hover:bg-red-500 active:bg-red-600 border-2 border-slate-400 p-1">
                                Cancel
                            </button>
                            <label className="font-sans text-sm">Item name:</label>
                            <ErrorMessage className="text-xs text-red-500" name="name" component="span" />
                            <Field className="border-2 border-slate-500 rounded-sm" id="nameField" name="name" placeholder="Describe your item ..." />
                            <label className="font-sans text-sm">Description:</label>
                            <ErrorMessage className="text-xs text-red-500" name="description" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="descriptionField" name="description" placeholder="Describe your item ..." />
                            <label className="font-sans text-sm">Quantity:</label>
                            <ErrorMessage className="text-xs text-red-500" name="quantity" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="quantityField" name="quantity" placeholder="How many items ..." />
                            <label className="font-sans text-sm">Price:</label>
                            <ErrorMessage className="text-xs text-red-500" name="price" component="span" /> 
                            <Field className="border-2 border-slate-500 rounded-sm" id="priceField" name="price" placeholder="How much it each one costs ..." />
                        </Form>
                   </Formik>
                }
            </div>
        </div>
    )
}

export default Items
