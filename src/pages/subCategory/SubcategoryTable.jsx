/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BiEdit } from 'react-icons/bi';

const SubcategoryTable = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [image, setImage] = useState(null);
    const [updateMode, setUpdateMode] = useState(false)
    const [id,setId] = useState("")
    const [submitLoad, setSubmitLoad] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        category: ""
    });
    const [isLoading, setIsLoading] = useState('');


    const fetchSubcategories = () => {

        setIsLoading(true)
        fetch('https://fotonoptix.onrender.com/api/subcategory?pageSize=1000&currentPage=1')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    console.log(data);
                    setSubcategories(data.subcategories);
                    setIsLoading(false)
                }
            })
            .catch(error => {
                setIsLoading(false)
                console.error('Error fetching subcategories:', error)
            });

    }

    const fetchCategories = () => {

        setIsLoading(true)
        fetch('https://fotonoptix.onrender.com/api/category?pageSize=1000&currentPage=1')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setCategories(data.categories);
                    setIsLoading(false)
                }
            })
            .catch(error => {
                setIsLoading(false)
                console.error('Error fetching categories:', error)
            });

    }

    useEffect(() => {
        fetchSubcategories()
        fetchCategories()
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            if (name === 'image') {
                setImage(files[0])
                setFormData(
                    {
                        ...formData,
                        image: ""
                    }
                )
            };
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const filteredProducts = subcategories?.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // console.log(subcategories);

    const handleUpdateValues = (subcategory) => {

        if(!subcategory.category?._id){
            toast.error("Category Does not exists")
            return
        }
        const file = document.querySelector(".image");
        file.value = "";
        setFormData({
            name: subcategory.name,
            image: subcategory.image,
            category: subcategory.category._id
        })
        setImage(null)
        setUpdateMode(true)
        setId(subcategory._id)

    }


    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoad(true)

        // Validation
        if (!formData.name || !(image || formData.image) || !formData.category) {
            toast.error("Please fill in all required fields.");
            setSubmitLoad(false)
            return;
        }


        let imageURL = '';
        if (image) {
            const iamgeRef = ref(storage, `subcategories/${formData.name}/${image.name}_sub`);
            const snapshot = await uploadBytes(iamgeRef, image);
            imageURL = await getDownloadURL(snapshot.ref);
        }

        let submitData = {
            ...formData,
            image: imageURL ? imageURL : formData.image,
        };

        console.log(submitData, id);

        fetch(`https://fotonoptix.onrender.com/api/subcategory/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRWZ0eWtoYXIgUmFobWFuIiwiZW1haWwiOiJlZnR5a2hhcnJhaG1hbkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTI3NTk1Mn0.J5EnGJ3QjAW8AsCMvjgrxEWCt-PT0OCRpT6H_PW4h5k`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(submitData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    console.log(data);
                    toast.success('subcategory updated successfully!');
                    fetchSubcategories()
                    setSubmitLoad(false)
                    setFormData({
                        name: '',
                        image: '',
                    })
                    setImage(null)
                    setUpdateMode(false)
                } else {
                    toast.error(data.message)
                    setSubmitLoad(false)
                    setFormData({
                        name: '',
                        image: '',
                    })
                    setImage(null)
                    setUpdateMode(false)
                }
            })
            .catch((error) => {
                toast.error('Error updating Subcategory.');
                console.error('Error:', error);
                setSubmitLoad(false)
                setFormData({
                    name: '',
                    image: '',
                })
                setImage(null)
                setUpdateMode(false)
            });

       
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoad(true)

        // Validation
        if (!formData.name || !image || !formData.category) {
            toast.error("Please fill in all required fields.");
            setSubmitLoad(false)
            return;
        }


        let imageURL = '';
        if (image) {
            const iamgeRef = ref(storage, `subcategories/${formData.name}/${image.name}_sub`);
            const snapshot = await uploadBytes(iamgeRef, image);
            imageURL = await getDownloadURL(snapshot.ref);
        }

        let submitData = {
            ...formData,
            image: imageURL ? imageURL : formData.image,
        };

        fetch('https://fotonoptix.onrender.com/api/subcategory', {
            method: 'POST',
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRWZ0eWtoYXIgUmFobWFuIiwiZW1haWwiOiJlZnR5a2hhcnJhaG1hbkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTI3NTk1Mn0.J5EnGJ3QjAW8AsCMvjgrxEWCt-PT0OCRpT6H_PW4h5k`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(submitData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    toast.success('Subcategory created successfully!');
                    fetchSubcategories()
                } else {
                    toast.error(data.message)
                }
            })
            .catch((error) => {
                toast.error('Error creating Subcategory.');
                console.error('Error:', error);
            });

        setSubmitLoad(false)
        setFormData({
            name: '',
            image: '',
            category: ''
        })
        setImage(null)
    };

    return (
        <div className="container mx-auto py-8">
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
            {!updateMode && <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">Subcategories</h1>
                <button disabled={submitLoad} onClick={handleSubmit} className="ml-4 block disabled:bg-slate-600 whitespace-nowrap px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Create Subcategory</button>
            </div>}
            {updateMode && <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">Update Subcategory</h1>
                <button disabled={submitLoad} onClick={handleUpdateSubmit} className="ml-4 block disabled:bg-slate-600 whitespace-nowrap px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600">Update Category</button>
            </div>}
            <div className='flex justify-center items-center gap-3 bg-slate-50 p-4 my-4 rounded-md shadow'>
                <div className="w-full">
                    <label className=" block text-gray-700 font-medium mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder='type category name...'
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                </div>
                <div className="w-full">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full">
                    <label className=" block text-gray-700 font-medium mb-2">Banner</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        className="image w-full px-4 py-2 border cursor-pointer rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />

                </div>
            </div>
            {(image && formData.image === "") && <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="h-44 object-cover my-4 border"
            />}
            {(!image && formData.image !== "") && <img
                src={formData.image}
                alt="Preview"
                className="h-44 object-cover my-4 border "
            />}

            {/* <h1 className="text-2xl font-bold mb-4">Category List</h1> */}
            {/* <div className="mb-4 flex justify-between">
                <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div>

                    <Link to="/create-product" className="ml-4 block whitespace-nowrap px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Create Category</Link>
                </div>
            </div> */}
            <div className="overflow-x-auto max-h-[60dvh] border rounded-md">
                <table className="min-w-full bg-white">
                    <thead className="bg-teal-500 text-white sticky top-0 left-0">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Num.</th>
                            <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                            <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                            <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Img.</th>
                            <th className="py-3 px-6 text-xs font-medium uppercase tracking-wider text-center">Edit</th>
                        </tr>
                    </thead>

                    {!isLoading &&
                        <tbody className="bg-white divide-y divide-teal-100">
                            {filteredProducts.map((subcategory, index) => (
                                <tr key={subcategory._id} className="hover:bg-teal-50  text-sm">
                                    <td className=" px-6 font-medium text-gray-900">

                                        {index + 1}

                                    </td>
                                    <td className=" px-6 font-medium text-gray-900">

                                        {subcategory.name}

                                    </td>
                                    <td className="px-6 text-gray-900 whitespace-nowrap">{subcategory?.category?.name || "N/A"}</td>
                                    <td className="px-6 font-medium text-gray-900">
                                        <img src={subcategory?.image} className=' h-14 block my-2 border bg-slate-200' alt="" placeholder='image' />
                                    </td>

                                    <td className=" px-6 text-gray-900" >
                                        <div className="flex justify-center items-center">
                                            <button onClick={() => handleUpdateValues(subcategory)} className='hover:text-lime-500 font-normal text-green-600'>
                                                <BiEdit className=' w-6 h-6' />
                                            </button>
                                        </div>
                                    </td>

                                   
                                </tr>
                            ))}
                        </tbody>}
                </table>
                {isLoading &&
                    <div className='flex justify-center items-center h-[20dvh]'>
                        <CgSpinner className='w-10 h-10 animate-spin' />
                    </div>
                }
            </div>
        </div>
    );
};

export default SubcategoryTable;
