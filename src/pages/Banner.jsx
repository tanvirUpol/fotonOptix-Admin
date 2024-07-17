/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BiEdit } from 'react-icons/bi';
import { FiDelete } from 'react-icons/fi';

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [banner, setBanner] = useState(null);
    const [updateMode, setUpdateMode] = useState(false)
    const [id, setId] = useState("")
    const [submitLoad, setSubmitLoad] = useState(false)
    const [formData, setFormData] = useState({
        title: 'slider',
        link: '',
    });
    const [isLoading, setIsLoading] = useState('');


    const fetchBanners = () => {

        setIsLoading(true)
        fetch('https://fotonoptix.onrender.com/api/banner?pageSize=1000&currentPage=1')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setBanners(data.banners);
                    setIsLoading(false)
                }
            })
            .catch(error => {
                setIsLoading(false)
                console.error('Error fetching banners:', error)
            });

    }

    useEffect(() => {
        fetchBanners()
    }, []);

    const handleChange = (e) => {
        const { name, files } = e.target;
        if (files) {
            if (name === 'banner') {
                const file = files[0];
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        if (img.width === 1920 && img.height === 900) {
                            setBanner(file);
                            setFormData({
                                ...formData,
                                link: ""
                            });
                        } else {
                            toast.error("Image dimensions must be exactly 1920x900 pixels.");
                        }
                    };
                    img.src = event.target.result;
                };
                
                reader.readAsDataURL(file);
            }
        }
    };

    const handleDeleteBanner = async (id) => {
        const userConfirmed = window.confirm("Are you sure you want to delete this banner?");
        
        if (userConfirmed) {
            try {
                const response = await fetch(`https://fotonoptix.onrender.com/api/banner/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                const data = await response.json();

                console.log(data);
                
                if (data.status) {
                    toast.success(data.message);
                    fetchBanners()
                    
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error("Error deleting banner:", error);
            }
        } else {
            toast.error("Banner deletion cancelled by user.");
        }
    };





    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoad(true)

        // Validation
        if (!formData.title || !banner) {
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
            link: bannerUrl ? bannerUrl : formData.banner,
        };

        console.log(submitData);

        fetch('https://fotonoptix.onrender.com/api/banner', {
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
                    setSubmitLoad(false)
                    setFormData({
                        title: 'slider',
                        link: '',
                    })
                    setBanner(null)
                    fetchBanners()
                    
                } else {
                    toast.error(data.message)
                    setSubmitLoad(false)
                    setFormData({
                        title: 'slider',
                        link: '',
                    })
                    setBanner(null)
                }
            })
            .catch((error) => {
                toast.error('Error creating banner.');
                console.error('Error:', error);
                setSubmitLoad(false)
                setFormData({
                    title: 'slider',
                    link: '',
                })
                setBanner(null)
            });


    };

    return (
        <div className="container mx-auto py-8 px-3">
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
            {!updateMode && <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">Banners</h1>
                <button disabled={submitLoad} onClick={handleSubmit} className="ml-4 block disabled:bg-slate-600 whitespace-nowrap px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Create Banner</button>
            </div>}
            {updateMode && <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">Update Category</h1>
                {/* <button disabled={submitLoad} onClick={handleUpdateSubmit} className="ml-4 block disabled:bg-slate-600 whitespace-nowrap px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600">Update Category</button> */}
            </div>}
            <div className='flex justify-center items-center gap-3 bg-slate-50 p-4 my-4 rounded-md shadow'>
                {/* <div className="w-full">
                    <label className=" block text-gray-700 font-medium mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={updateMode}
                        placeholder='type category name...'
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                </div> */}
                <div className="w-full">
                    <label className=" block text-gray-700 font-medium mb-2">Select your Banner: [1920x900]</label>
                    <input
                        type="file"
                        name="banner"
                        onChange={handleChange}
                        className="banner w-full px-4 py-2 border cursor-pointer rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />

                </div>
            </div>
            {(banner && formData.link === "") && <img
                src={URL.createObjectURL(banner)}
                alt="Preview"
                className="h-full object-cover my-4"
            />}
            {(!banner && formData.link !== "") && <img
                src={formData.link}
                alt="Preview"
                className="h-full object-cover my-4"
            />}

            {/* <h1 className="text-2xl font-bold mb-4">Category List</h1> */}
            {/* <div className="mb-4 flex justify-between">
                <input
                    type="text"
                    placeholder="Search banners..."
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
                            <th className="py-3 px-6 text-center text-xs font-medium uppercase tracking-wider">Title</th>
                            <th className="py-3 px-6 text-center text-xs font-medium uppercase tracking-wider">Img.</th>
                            <th className="py-3 px-6 text-xs font-medium uppercase tracking-wider text-center">Delete</th>
                        </tr>
                    </thead>

                    {!isLoading &&
                        <tbody className="bg-white divide-y divide-teal-100">
                            {banners.map((banner, index) => (
                                <tr key={banner._id} className="hover:bg-teal-50  text-sm">
                                    <td className=" px-6 font-medium text-gray-900">

                                        {index + 1}

                                    </td>
                                    <td className=" px-6 font-medium text-center text-gray-900 uppercase">

                                        {banner.title}

                                    </td>
                                    <td className="px-6 font-medium text-gray-900 flex justify-center items-center">
                                        <img src={banner?.link} className=' h-20 block my-2 border bg-slate-200' alt="" placeholder='image' />
                                    </td>

                                    <td className=" px-6 text-gray-900" >
                                        <div className="flex justify-center items-center">
                                            <button onClick={() => handleDeleteBanner(banner._id)} className='hover:text-red-800 font-normal text-red-600'>
                                                <FiDelete className=' w-6 h-6' />
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

export default Banner;
