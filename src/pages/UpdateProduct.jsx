/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CgSpinner } from 'react-icons/cg';
import { MdKeyboardBackspace } from 'react-icons/md';
import DataTable from '../components/DataTable';
import { BsBoxSeam } from 'react-icons/bs';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const UpdateProduct = () => {
    let { id } = useParams();
    console.log(id);
    const [subCategories, setSubCategories] = useState([]);
    const [productData, setProductData] = useState(null)
    const [showCaseImages, setShowCaseImages] = useState([])
    const [diagram, setDiagram] = useState("")
    const [fetchedSpecificationImage, setFetchedSpecificationImage] = useState("")
    const [categories, setCategories] = useState([]);
    const [file, setFile] = useState(null);
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
        specificationImage: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [schematicFile, setSchematicFile] = useState(null);
    const [specificationImage, setSpecificationImage] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoad,setSubmitLoad] = useState(false)


    const fetchProduct = () => {
        fetch(`https://fotonoptix.onrender.com/api/product/${id}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRWZ0eWtoYXIgUmFobWFuIiwiZW1haWwiOiJlZnR5a2hhcnJhaG1hbkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTI3NTk1Mn0.J5EnGJ3QjAW8AsCMvjgrxEWCt-PT0OCRpT6H_PW4h5k`,
                },
            }
        )
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setProductData(data.product);
                    setShowCaseImages(data.product.image)
                    setDiagram(data.product.schematicDiagram)
                    setFetchedSpecificationImage(data.product?.specificationImage)
                    if (data.product.specifications.length > 0) {
                        setData(data.product.specifications);
                      } else if (data.product.specifications2.length > 0) {
                        setData(data.product.specifications2);
                      } else if (data.product.specifications3.length > 0) {
                        setData(data.product.specifications3);
                      } else if (data.product.customSpecifications?.length > 0) {
                        setData(data.product.customSpecifications);
                      }
                    setFormData({
                        ...formData,
                        name: data.product.name,
                        category: data.product.category._id,
                        subcategory: data.product.subcategory._id,
                        description: data.product.description,
                        features: data.product.features.join(", "),
                        applications: data.product.applications.join(", "),
                        schematicDiagram: data.product.schematicDiagram,
                        image: data.product.image,
                        specificationImage: data.product?.specificationImage

                    })
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // console.log({data});

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
        fetchCat();
        fetchSubCat();
        fetchProduct();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            if (name === 'imageFiles') {
                setImageFiles([...imageFiles, ...Array.from(files)]);
            }
            if (name === 'specificationImage'){
                setSpecificationImage(files[0])
                setFetchedSpecificationImage("")
            }
            if (name === 'schematicFile') {
                setSchematicFile(files[0])
                setDiagram("")
            };
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleRemoveImage = (index) => {
        setImageFiles(imageFiles.filter((_, i) => i !== index));
        const file = document.querySelector(".images");
        file.value = "";
    };
    const handleRemoveFetchedImage = (image) => {
        setShowCaseImages(showCaseImages.filter((item) => item !== image));
        const file = document.querySelector(".images");
        file.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoad(true)
        // Validation
        if (!formData.name || !formData.category || !formData.subcategory || !formData.description || !formData.features || !formData.applications) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const imageUrls = await Promise.all(imageFiles.map(async (file) => {
            const imageRef = ref(storage, `new-products/${formData.name}/${file.name}`);
            const snapshot = await uploadBytes(imageRef, file);
            return getDownloadURL(snapshot.ref);
        }));

        let schematicUrl = '';
        if (schematicFile) {
            const schematicRef = ref(storage, `new-products/${formData.name}/${schematicFile.name}_sd`);
            const snapshot = await uploadBytes(schematicRef, schematicFile);
            schematicUrl = await getDownloadURL(snapshot.ref);
        }

        let specificationImgURL = '';
        if (specificationImage) {
            const schematicRef = ref(storage, `new-products/${formData.name}/${specificationImage.name}_sd`);
            const snapshot = await uploadBytes(schematicRef, specificationImage);
            specificationImgURL = await getDownloadURL(snapshot.ref);
        }

        let submitData = {
            ...formData,
            image: imageUrls.length > 0 ? [...showCaseImages, ...imageUrls] : [...showCaseImages, ...imageUrls],
            schematicDiagram: schematicUrl ? schematicUrl : formData.schematicDiagram,
            features: formData.features.split(',').map(feature => feature.trim()),
            applications: formData.applications.split(',').map(app => app.trim()),
            customSpecifications: data,
            specificationImage: specificationImgURL ? specificationImgURL : formData?.specificationImage
        };

        // console.log(submitData);

        fetch(`https://fotonoptix.onrender.com/api/product/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRWZ0eWtoYXIgUmFobWFuIiwiZW1haWwiOiJlZnR5a2hhcnJhaG1hbkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTI3NTk1Mn0.J5EnGJ3QjAW8AsCMvjgrxEWCt-PT0OCRpT6H_PW4h5k`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(submitData)
        })
            .then(response => response.json())
            .then(data => {
                if(data.status){
                    toast.success('Product updated successfully!');
                }else{
                    toast.error(data.message)
                }
            })
            .catch((error) => {
                toast.error('Error creating product.');
                console.error('Error:', error);
            });

        setSubmitLoad(false)
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setFile(file);
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

                    setData(jsonData);
                } catch (error) {
                    console.error('Error reading the Excel file:', error);
                    setLoading(false);
                    const file = document.querySelector(".file");
                    file.value = "";
                    setFile(null);
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
            setFile(null);
            setData([]);
        }
    };

    const removeFile = (e) => {
        const file = document.querySelector(".excel-file");
        file.value = "";
        e.preventDefault();
        setFile(null);
        setData([]);
    };

    return (
        <div className="container lg:max-w-5xl mx-auto py-8 px-4 text-sm">
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
            <form onSubmit={handleSubmit}>
                <div className='flex justify-between items-center mb-4'>
                    <h1 className="text-2xl font-bold  flex justify-center items-center gap-3">
                        <BsBoxSeam className='w-6 h-6' />
                        Update Product
                    </h1>
                    <button
                        type="submit"
                        disabled={submitLoad}
                        className="px-4 py-2 disabled:bg-gray-700  bg-teal-500 text-white rounded-md hover:bg-teal-600"
                    >
                        {submitLoad? "Updating...": "Update Product"}
                    </button>
                </div>
                <hr className='my-4' />
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
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Subcategory</label>
                    <select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    >
                        <option value="">Select Subcategory</option>
                        {subCategories.map(subcategory => (
                            formData.category === subcategory.category._id && <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Features</label>
                    <input
                        type="text"
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                        placeholder="Comma separated values"
                    />
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Applications</label>
                    <input
                        type="text"
                        name="applications"
                        value={formData.applications}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                        placeholder="Comma separated values"
                    />
                </div>
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Product Images</label>
                    <input
                        type="file"
                        name="imageFiles"
                        onChange={handleChange}
                        className="images w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                        multiple
                    />
                    <div className="flex flex-wrap gap-2">
                        {
                            showCaseImages?.length > 0 && showCaseImages.map((file, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={file}
                                        alt="Preview"
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                        onClick={() => handleRemoveFetchedImage(file)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        }
                        {imageFiles.map((file, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                                <button
                                    type="button"
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                


                {/* specification image */}
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Specification Image</label>
                    <input
                        type="file"
                        name="specificationImage"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                </div>
                <div className='mb-4'>
                    {specificationImage && <img
                        src={URL.createObjectURL(specificationImage)}
                        alt="Preview"
                        className=" w-1/4 object-cover rounded-md border"
                    />}
                    {
                        fetchedSpecificationImage.length > 0 &&
                        <img
                        src={fetchedSpecificationImage}
                        alt="Preview"
                        onClick={()=> {
                            setFetchedSpecificationImage("")
                            setFormData({...formData, specificationImage: ""})
                        }}
                        className=" w-1/4 object-cover rounded-md border"
                    />
                    }
                </div>
                {/* specification */}
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Specifications File: (xlsx)</label>
                    <div className="flex ">
                        <input
                            type="file"
                            name="specificationDocument"
                            className="excel-file w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 file"
                            onChange={handleFileChange}
                        />
                        {data.length > 0 && <button
                            className="bg-red-500 text-white rounded-md px-4 py-2 ml-2"
                            onClick={removeFile}
                        >
                            Remove
                        </button>}
                    </div>
                </div>
                <hr className="my-4" />
                {loading ? (
                    <div className="flex justify-center">
                        <CgSpinner className="animate-spin w-8 h-8 text-teal-500" />
                    </div>
                ) : (
                     data.length > 0 && (
                        <DataTable data={data} />
                    )
                )}

                {/* SCHEMATIC DIAGRAM */}
                <div className="mb-4">
                    <label className="uppercase block text-gray-700 font-medium mb-2">Schematic Diagram</label>
                    <input
                        type="file"
                        name="schematicFile"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                </div>
                <div className='mb-4'>
                    {schematicFile && <img
                        src={URL.createObjectURL(schematicFile)}
                        alt="Preview"
                        className=" w-1/4 object-cover rounded-md border"
                    />}
                    {
                        diagram.length > 0 &&
                        <img
                        src={diagram}
                        alt="Preview"
                        className=" w-1/4 object-cover rounded-md border"
                    />
                    }
                </div>
            </form>
        </div>
    );
};

export default UpdateProduct;
