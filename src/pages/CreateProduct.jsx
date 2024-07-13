/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
// import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CgSpinner } from 'react-icons/cg';
import { MdKeyboardBackspace } from 'react-icons/md';
import DataTable from '../components/DataTable';

const CreateProduct = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [file, setFile] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subcategory: '',
        description: '',
        features: '',
        specificationDocument: '',
        manualDocument: '',
        image: [],
        schematicDiagram: '',
        applications: '',
        customSpecifications: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [schematicFile, setSchematicFile] = useState(null);
    const [specificationInput, setSpecificationInput] = useState({
        key: '',
        value: ''
    });

    const [data, setData] = useState([])
    const [rawData, setRawData] = useState([])
    const [loading, setLoading] = useState(false);


    //   const history = useHistory();


    const fetchCat = () => {
        fetch('https://fotonoptix.onrender.com/api/category?pageSize=9999&currentPage=')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setCategories(data.categories);
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }


    const fetchSubCat = () => {
        fetch('https://fotonoptix.onrender.com/api/subcategory?pageSize=9999&currentPage=')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setSubCategories(data.subcategories);
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }


    useEffect(() => {
        fetchCat()
        fetchSubCat()
    }, []);


    console.log({ categories, subCategories });


    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            if (name === 'imageFiles') {
                setImageFiles([...imageFiles, ...Array.from(files)]);
            }
            if (name === 'schematicFile') setSchematicFile(files[0]);
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };


    const handleRemoveImage = (index) => {
        setImageFiles(imageFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const imageUrls = await Promise.all(imageFiles.map(async (file) => {
            const imageRef = ref(storage, `new-products/${formData.name}/${file.name}`);
            const snapshot = await uploadBytes(imageRef, file);
            return getDownloadURL(snapshot.ref);
        }));

        console.log({ imageUrls });

        let schematicUrl = '';
        if (schematicFile) {
            const schematicRef = ref(storage, `new-products/${formData.name}/${schematicFile.name}_sd`);
            const snapshot = await uploadBytes(schematicRef, schematicFile);
            schematicUrl = await getDownloadURL(snapshot.ref);
        }

        console.log({ schematicUrl });

        let submitData = {
            ...formData,
            image: imageUrls.length ? imageUrls : formData.image,
            schematicDiagram: schematicUrl ? schematicUrl : formData.schematicDiagram,
            features: formData.features.split(',').map(feature => feature.trim()),
            applications: formData.applications.split(',').map(app => app.trim()),
            customSpecifications: data
        };

        console.log(submitData);

        fetch('http://localhost:8000/api/product', {
            method: 'POST',
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRWZ0eWtoYXIgUmFobWFuIiwiZW1haWwiOiJlZnR5a2hhcnJhaG1hbkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTI3NTk1Mn0.J5EnGJ3QjAW8AsCMvjgrxEWCt-PT0OCRpT6H_PW4h5k`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(submitData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    };


    const handleFileChange = async (e) => {

        const file = e.target.files[0];
        setFile(file)
        setLoading(true);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const binaryData = e.target?.result;

                try {
                    const workbook = XLSX.read(binaryData, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    let jsonData = XLSX.utils.sheet_to_json(sheet, {
                        defval: 'not available', // Set default value for empty cells
                    });


                    // Convert all values to string
                    jsonData = jsonData.map((row) => {
                        const stringRow = {};
                        Object.keys(row).forEach((key) => {
                            stringRow[key.toLowerCase()] = row[key].toString();
                        });
                        return stringRow;
                    });

                    setRawData(jsonData)

                    function toCamelCase(str) {
                        return str
                            .toLowerCase()
                            .replace(/([-_\s][a-z])/g, (group) =>
                                group.toUpperCase()
                                    .replace('-', '')
                                    .replace('_', '')
                                    .replace(' ', '')
                            );
                    }

                    if (jsonData.length > 0) {
                        jsonData = jsonData.map((row) => {
                            const camelCaseRow = {};
                            Object.keys(row).forEach((key) => {
                                const camelCaseKey = toCamelCase(key.trim());
                                camelCaseRow[camelCaseKey] = row[key];
                            });
                            return camelCaseRow;
                        });
                    }

                    // console.log(Object.keys(lowercaseKeys));
                    console.log({ rawData: jsonData });
                    setData(jsonData);

                } catch (error) {
                    console.error('Error reading the Excel file:', error);
                    setLoading(false);
                    const file = document.querySelector(".file");
                    file.value = "";
                    setFile(null)
                    setData([]);
                } finally {
                    setLoading(false);
                }
            };

            reader.readAsBinaryString(file);
        } catch (error) {
            console.error('Error reading the Excel file:', error);
            setLoading(false);
            const file = document.querySelector(".file");
            file.value = "";
            setFile(null)
            setData([]);
        }
    };

    const removeFile = (e) => {
        e.preventDefault();
        setFile(null)
        setData([]);
        setRawData([])
    };

    return (
        <div className="container mx-auto py-8 text-sm">
            <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Category</label>
                    <select
                        className="w-full border  border-gray-200 py-3 px-2 bg-zinc-100/40 rounded"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Subcategory</label>
                    <select
                        className="w-full border  border-gray-200 py-3 px-2 bg-zinc-100/40 rounded"
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        disabled={formData.category === ""}
                        onChange={handleChange}
                    >
                        <option value="">Select sub category</option>
                        {subCategories.map((subcategory, index) => (
                            (subcategory.category._id === formData.category && <option key={index} value={subcategory._id}>
                                {subcategory.name}
                            </option>)
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Features (comma separated)</label>
                    <input
                        type="text"
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Image Files</label>
                    <input
                        type="file"
                        name="imageFiles"
                        onChange={handleChange}
                        multiple
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />

                    <div className="mt-4">
                        {imageFiles.map((file, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <img onClick={() => handleRemoveImage(index)} src={URL.createObjectURL(file)} className="w-12 h-12 border p-2 object-cover mr-2 cursor-pointer" alt={`Upload ${index}`} />

                            </div>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Schematic Diagram File</label>
                    <input
                        type="file"
                        name="schematicFile"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Applications (comma separated)</label>
                    <input
                        type="text"
                        name="applications"
                        value={formData.applications}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                </div>

                {/* upload excel */}
                {<div className="flex flex-col items-start gap-2 mt-2  ">
                    <p className=' font-medium uppercase'>Upload Specification File:</p>
                    {data.length <= 0 && 

                    <>
                    <label
                        className="group cursor-pointer w-full flex flex-col justify-center items-center gap-5 bg-[#E1F0FF]/40 py-6 rounded-md border-2 bor border-dashed border-gray-500 hover:border-teal-500"
                        htmlFor="upload"
                    >

                        {data.length === 0 && !loading &&
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-gray-500 group-hover:text-teal-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <span className="text-gray-700 font-medium mb-2 group-hover:text-teal-500 text-md text-center">
                                    Click to upload excel (.xlsx)
                                </span>
                            </>
                        }
                    </label>
                    <input
                        type="file"
                        accept=".xlsx, .xls, .xlsb"
                        id='upload'
                        onChange={handleFileChange}
                        disabled={loading}
                        className="py-2 px-4 border rounded file hidden"
                    />
                    <p className='text-right w-full text-gray-400 text-sm'>Supported format: XLS , XLSX , XLSB</p>
                    </>
                    }
                   


                </div>}

                {rawData.length > 0 &&
                    <>
                        <div className='flex justify-end items-center gap-3'>
                           
                            <button
                                className="py-2 px-3 flex justify-center items-center gap-2 bg-rose-900  text-white rounded mb-4
                                "
                                onClick={removeFile}
                            >
                                <span>Remove File</span>
                            </button>
                        </div>
                        <DataTable data={rawData} />
                    </>
                }

                <button
                    type="submit"
                    className="px-4 py-2 mt-4 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                >
                    Create Product
                </button>
            </form>
        </div>
    );
};

export default CreateProduct;
