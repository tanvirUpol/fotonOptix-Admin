/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BiEdit } from 'react-icons/bi';

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [banner, setBanner] = useState(null);
    const [fetchedBanner, setFetchedBanner] = useState('');
    const [updateMode, setUpdateMode] = useState(false)
    const [id,setId] = useState("")
    const [submitLoad, setSubmitLoad] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        banner: '',
    });
    const [isLoading, setIsLoading] = useState('');


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
        fetchCategories()
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            if (name === 'banner') {
                setBanner(files[0])
                setFormData(
                    {
                        ...formData,
                        banner: ""
                    }
                )
            };
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const filteredProducts = categories.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // console.log(categories);

    const handleUpdateValues = (category) => {
        const file = document.querySelector(".banner");
        file.value = "";
        setFormData({
            name: category.name,
            banner: category.banner,
        })
        setBanner(null)
        setUpdateMode(true)
        setId(category._id)

    }


    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoad(true)

        // Validation
        if (!formData.name || !(banner || formData.banner)) {
            toast.error("Please fill in all required fields.");
            setSubmitLoad(false)
            return;
        }


        let bannerUrl = '';
        if (banner) {
            const bannerRef = ref(storage, `new-products/${formData.name}/${banner.name}_sd`);
            const snapshot = await uploadBytes(bannerRef, banner);
            bannerUrl = await getDownloadURL(snapshot.ref);
        }

        let submitData = {
            ...formData,
            banner: bannerUrl ? bannerUrl : formData.banner,
        };

        console.log(submitData, id);

        fetch(`https://fotonoptix.onrender.com/api/category/${id}`, {
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
                    toast.success('category updated successfully!');
                    fetchCategories()
                } else {
                    toast.error(data.message)
                }
            })
            .catch((error) => {
                toast.error('Error updating Category.');
                console.error('Error:', error);
            });

        setSubmitLoad(false)
        setFormData({
            name: '',
            banner: '',
        })
        setBanner(null)
        setFetchedBanner("")
        setUpdateMode(false)
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoad(true)

        // Validation
        if (!formData.name || !banner) {
            toast.error("Please fill in all required fields.");
            setSubmitLoad(false)
            return;
        }


        let bannerUrl = '';
        if (banner) {
            const bannerRef = ref(storage, `new-products/${formData.name}/${banner.name}_sd`);
            const snapshot = await uploadBytes(bannerRef, banner);
            bannerUrl = await getDownloadURL(snapshot.ref);
        }

        let submitData = {
            ...formData,
            banner: bannerUrl ? bannerUrl : formData.banner,
        };

        fetch('https://fotonoptix.onrender.com/api/category', {
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
                    toast.success('category created successfully!');
                    fetchCategories()
                } else {
                    toast.error(data.message)
                }
            })
            .catch((error) => {
                toast.error('Error creating Category.');
                console.error('Error:', error);
            });

        setSubmitLoad(false)
        setFormData({
            name: '',
            banner: '',
        })
        setBanner(null)
    };

    return (
        <div className="container mx-auto py-8">
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
            {!updateMode && <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">Categories</h1>
                <button disabled={submitLoad} onClick={handleSubmit} className="ml-4 block disabled:bg-slate-600 whitespace-nowrap px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Create Category</button>
            </div>}
            {updateMode && <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">Update Category</h1>
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
                        // disabled={updateMode}
                        placeholder='type category name...'
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                </div>
                <div className="w-full">
                    <label className=" block text-gray-700 font-medium mb-2">Banner</label>
                    <input
                        type="file"
                        name="banner"
                        onChange={handleChange}
                        className="banner w-full px-4 py-2 border cursor-pointer rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />

                </div>
            </div>
            {(banner && formData.banner === "") && <img
                src={URL.createObjectURL(banner)}
                alt="Preview"
                className="h-full object-cover my-4"
            />}
            {(!banner && formData.banner !== "") && <img
                src={formData.banner}
                alt="Preview"
                className="h-full object-cover my-4"
            />}

            {/* <h1 className="text-2xl font-bold mb-4">Category List</h1> */}
            {/* <div className="mb-4 flex justify-between">
                <input
                    type="text"
                    placeholder="Search categories..."
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
                            <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Img.</th>
                            <th className="py-3 px-6 text-xs font-medium uppercase tracking-wider text-center">Edit</th>
                        </tr>
                    </thead>

                    {!isLoading &&
                        <tbody className="bg-white divide-y divide-teal-100">
                            {filteredProducts.map((category, index) => (
                                <tr key={category._id} className="hover:bg-teal-50  text-sm">
                                    <td className=" px-6 font-medium text-gray-900">

                                        {index + 1}

                                    </td>
                                    <td className=" px-6 font-medium text-gray-900">

                                        {category.name}

                                    </td>
                                    <td className="px-6 font-medium text-gray-900">
                                        <img src={category?.banner} className=' h-14 block my-2 border bg-slate-200' alt="" placeholder='image' />
                                    </td>

                                    <td className=" px-6 text-gray-900" >
                                        <div className="flex justify-center items-center">
                                            <button onClick={() => handleUpdateValues(category)} className='hover:text-lime-500 font-normal text-green-600'>
                                                <BiEdit className=' w-6 h-6' />
                                            </button>
                                        </div>
                                    </td>

                                    {/* <td className="py-3 px-6 text-gray-500 whitespace-nowrap">{product.category.name}</td> */}
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

export default CategoryTable;
