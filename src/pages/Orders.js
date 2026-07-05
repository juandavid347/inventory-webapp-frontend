import React from 'react'
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function Orders() {

    const backendURL = "https://inventory-webapp-backend-production.up.railway.app:8080";
    const navigate = useNavigate();
    const [listOfOrders, setListOfOrders] = useState([]);
    
    const [addOrderVisible, setAddOrderVisible] = useState(false);
    const [editOrderVisible, setEditOrderVisible] = useState(false);
    const [addItemNumbers, setAddItemNumbers] = useState(0);

    const [initialValues, setInitialValues] = useState({});
    
    const [listOfContacts, setListOfContacts] = useState([]);
    const [listOfItems, setListOfItems] = useState([]);
    
    const [editValues, setEditValues] = useState({
        id: null,
        kind: "",
        Contact :{
            id: null,
            name: "",
        },
        OrderItems: [{}],
    });
    
    const validationSchema = Yup.object().shape({
        kind: Yup.string().required(),
        contactId: Yup.number().required().positive().integer(),
    });
    
    const validationSchemaEdit = Yup.object().shape({
        id: Yup.number().required().positive().integer(),
        kind: Yup.string().required(),
        Contact: Yup.object().shape({
            id: Yup.number().required().positive().integer(),
            name: Yup.string().required(),
        }),        
    });
    
    const onSubmitNew = async (data) => {
        try {
            await axios.post(`${backendURL}/orders`, data, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
                if (!Object.hasOwn(response.data, "Contact")) return alert(response.data);
                if (response.data.Contact.id == data.contactId) {
                    var newOrders = listOfOrders;
                    newOrders.push(response.data);
                    setListOfOrders(newOrders);
                    setAddOrderVisible(false);
                    setAddItemNumbers(0);
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
            await axios.put(`${backendURL}/orders`, data, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
                if (response.data.id === data.id) {
                    const newOrders = listOfOrders.map(Order => Order.id === response.data.id ? response.data : Order)
                    setListOfOrders(newOrders);
                    setEditOrderVisible(false);
                } else {
                    alert(response.data);
                }
            });
        } catch (error) {
            alert(`Server error ${error}, review your input`);
        }
    }
    
    const editOrder = (value) => {
        setEditValues({
            id: value.id,
            kind: value.kind,
            Contact: {
                id: value.Contact.id,
                name: value.Contact.name,
            },
            OrderItems: value.OrderItems,
        });
        setEditOrderVisible(true);
    }
    
    const deleteOrder = async (data) => {
        if(window.confirm("Confirm deletion!")) {
            try {
                await axios.delete(`${backendURL}/orders/${data.id}`, { headers: { accessToken: localStorage.getItem("accessToken") }, }).then((response) => {
                    if (response.data == data.id) {
                        const newOrders = listOfOrders.filter((Order) => Order.id !== data.id);
                        setListOfOrders(newOrders);
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
        
        axios.get(`${backendURL}/orders`, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
            if (response.data.error) navigate("/login");
            else setListOfOrders(response.data);
        });
        
        axios.get(`${backendURL}/contacts`, { headers: { accessToken: localStorage.getItem("accessToken") }, }).then((response) => {
            if (!response.data.error) {
                setListOfContacts(response.data);
            }
        });
        
        axios.get(`${backendURL}/items`, { headers: { accessToken: localStorage.getItem("accessToken") }, }).then((response) => {
            if (!response.data.error) {
                setListOfItems(response.data);
            }
        });
        
        
    }, []);
    
    const parseOrderItems = (OrderItems) => {
        if (OrderItems.length !== 0) {
            var parsedOrderItem = "";
            OrderItems.map((OrderItem) => {
                parsedOrderItem += OrderItem.Item.name + " (" + OrderItem.quantity + "), ";
            });
            return parsedOrderItem.substr(0, parsedOrderItem.length - 2);
        } else {
            return "";
        }
    }
    
    const listOrders = listOfOrders.map((value, key) =>
        <tr key={key} class="hover:bg-cyan-200 *:border-collapse *:border-slate-300 border-slate-300 border-b-2 *:border-r-2 *:rounded-xl">
            <td>{value.kind}</td>
            <td>{new Date(value.date).toUTCString()}</td>
            <td>{value.status}</td>
            <td>{value.Contact.name}</td>
            <td>{parseOrderItems(value.OrderItems)}</td>
            <td class="cursor-pointer hover:bg-cyan-300 text-center border-none" onClick={() => editOrder(value)}>Edit</td>
            <td class="cursor-pointer hover:bg-cyan-300 text-center border-none" onClick={() => deleteOrder(value)}>Delete</td>
        </tr>
    );
    
    const listContacts = listOfContacts.map((item, key) => 
        <option key={key} value={item.id}>{item.name}</option>
    );
    
    const listItems = listOfItems.map((item, key) => 
        <option key={key} value={item.id}>{item.name}</option>
    );
    
    const addNewItem = () => {
        var newItemNumbers = addItemNumbers + 1;
        setAddItemNumbers(newItemNumbers);
    };
    
    
    const listItemForms = () => {
        const customIds = Array.from(Array(addItemNumbers).keys(), (item) => `Items[${item }].id`);
        const customQtys = Array.from(Array(addItemNumbers).keys(), (item) => `Items[${item }].quantity`);
        return Array.from(Array(addItemNumbers).keys(), (item) =>
            <>
                <label className="font-sans text-sm">Item {item + 1}:</label>
                <Field className="border-2 border-slate-500 rounded-sm" id={customIds[item]} name={customIds[item]} as="select">
                    <option disabled selected value> -- Select an Item -- </option>
                    {listItems}
                </Field>
                <label className="font-sans text-sm">Quantity:</label>
                <Field className="border-2 border-slate-500 rounded-sm" id={customQtys[item]} name={customQtys[item]} />
            </>
        );
    };
    
    const listEditItems = (length) => {
        const customIds = Array.from(Array(length).keys(), (item) => `OrderItems[${item }].Item.id`);
        const customQtys = Array.from(Array(length).keys(), (item) => `OrderItems[${item }].quantity`);
        return Array.from(Array(length).keys(), (item) =>
            <>
                <label className="font-sans text-sm">Item {item + 1}:</label>
                <Field className="border-2 border-slate-500 rounded-sm" id={customIds[item]} name={customIds[item]} as="select">
                    {listItems}
                </Field>
                <label className="font-sans text-sm">Quantity:</label>
                <Field className="border-2 border-slate-500 rounded-sm" id={customQtys[item]} name={customQtys[item]} />
            </>
        );
    };
    
    return (
        <div class="flex justify-between w-full h-full">
            <div class="flex items-start p-1">
                {!addOrderVisible && 
                    <button onClick={() => { setAddOrderVisible(true); }} className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1">
                        Add New Order
                    </button>
                }
                {addOrderVisible && 
                    <div className="gap-2 border-2 border-slate-500 rounded-md p-2 m-1">
                        <Formik initialValues={initialValues} onSubmit={onSubmitNew} validationSchema={validationSchema} enableReinitialize={true}>
                            <Form className="grid gap-1">
                                <button className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1" type="submit">
                                    Add Order
                                </button>
                                <button onClick={() => { setAddOrderVisible(false); setAddItemNumbers(0); }} className="bg-red-400 rounded-md hover:bg-red-500 active:bg-red-600 border-2 border-slate-400 p-1">
                                    Cancel
                                </button>
                                <label className="font-sans text-sm">Kind:</label>
                                <ErrorMessage className="text-xs text-red-500" name="kind" component="span" />
                                <Field className="border-2 border-slate-500 rounded-sm" id="kindField" name="kind" as="select">
                                    <option disabled selected value> -- Select a Kind -- </option>
                                    <option value="Sale">Sale</option>
                                    <option value="Purchase">Purchase</option>
                                </Field>
                                <label className="font-sans text-sm">Contact:</label>
                                <ErrorMessage className="text-xs text-red-500" name="contactId" component="span" /> 
                                <Field className="border-2 border-slate-500 rounded-sm" id="contactIdField" name="contactId" as="select">
                                    <option disabled selected value> -- Select a Contact -- </option>
                                    {listContacts}
                                </Field>
                                {listItemForms()}
                            </Form>
                        </Formik>
                        <button onClick={addNewItem} className="bg-slate-400 rounded-md hover:bg-slate-500 active:bg-slate-600 border-2 border-black-400 p-1">
                            Add Item
                        </button>
                    </div>
                }
            </div>
            <div class="flex items-center w-2/3 p-1 rounded-xl shadow-lg outline outline-black/5">
                <table class="table w-full bg-cyan-100 rounded-xl">
                    <thead>
                        <tr class="border-b-2 border-collapse border-slate-300">
                            <th class="rounded-md">Kind</th>
                            <th class="rounded-md">Date</th>
                            <th class="rounded-md">Status</th>
                            <th class="rounded-md">Contact</th>
                            <th class="rounded-md">Items (Quantity)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listOrders}
                    </tbody>
                </table>
            </div>
            <div class="flex items-start p-1">
                {editOrderVisible && 
                    <Formik initialValues={editValues} onSubmit={onSubmitEdit} validationSchema={validationSchemaEdit} enableReinitialize={true}>
                        <Form className="grid gap-2 border-2 border-slate-500 rounded-md p-2 m-1">
                            <button className="bg-cyan-200 rounded-md hover:bg-cyan-300 active:bg-cyan-400 border-2 border-slate-400 p-1" type="submit">
                                Save changes
                            </button>
                            <button onClick={() => { setEditOrderVisible(false); }} className="bg-red-400 rounded-md hover:bg-red-500 active:bg-red-600 border-2 border-slate-400 p-1">
                                Cancel
                            </button>
                            <label className="font-sans text-sm">Kind:</label>
                            <ErrorMessage className="text-xs text-red-500" name="kind" component="span" />
                            <Field className="border-2 border-slate-500 rounded-sm" id="kindField" name="kind" as="select">
                                <option value="Sale">Sale</option>
                                <option value="Purchase">Purchase</option>
                            </Field>
                            <label className="font-sans text-sm">Contact:</label>
                            <ErrorMessage className="text-xs text-red-500" name="Contact.id" component="span" />
                            <Field className="border-2 border-slate-500 rounded-sm" id="Contact.idField" name="Contact.id" as="select">
                                {listContacts}
                            </Field>
                            {listEditItems(editValues.OrderItems.length)}
                        </Form>
                   </Formik>
                }
            </div>
        </div>
    )
}

export default Orders
