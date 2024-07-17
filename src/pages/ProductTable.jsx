/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { MdDeleteForever } from 'react-icons/md';

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const [submitLoad, setSubmitLoad] = useState(false)

  const fetchProducts = async () => {
    setIsLoading(true)
    fetch('https://fotonoptix.onrender.com/api/product?pageSize=1000&currentPage=1')
      .then(response => response.json())
      .then(data => {
        if (data.status) {
          setProducts(data.products);
          setIsLoading(false)
        }
      })
      .catch(error => {
        setIsLoading(false)
        console.error('Error fetching products:', error)
      });
  }

  useEffect(() => {
    fetchProducts()
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleDelete = async (id) => {
    const userConfirmed = window.confirm("Are you sure you want to delete this product?");

    if (userConfirmed) {
      setSubmitLoad(true)

      fetch(`https://fotonoptix.onrender.com/api/product/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRWZ0eWtoYXIgUmFobWFuIiwiZW1haWwiOiJlZnR5a2hhcnJhaG1hbkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTI3NTk1Mn0.J5EnGJ3QjAW8AsCMvjgrxEWCt-PT0OCRpT6H_PW4h5k`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isDeleted: true })
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            console.log(data);
            toast.success('product deleted successfully!');
            fetchProducts()
            setSubmitLoad(false)
          } else {
            toast.error(data.message)
            setSubmitLoad(false)
          }
        })
        .catch((error) => {
          toast.error('Error deleting product.');
          console.error('Error:', error);
          setSubmitLoad(false)

        });
    }
  }


  return (
    <div className="container mx-auto py-8 px-3">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <div>

          <Link to="/create-product" className="ml-4 block whitespace-nowrap px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Create Product</Link>
        </div>
      </div>
      <div className="overflow-x-auto h-[73dvh] border rounded-md">
        <table className="min-w-full bg-white">
          <thead className="bg-teal-500 text-white sticky top-0 left-0">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Img.</th>
              <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Category</th>
              <th className="py-3 px-6 text-center text-xs font-medium uppercase tracking-wider">Edit</th>
            </tr>
          </thead>

          {!isLoading &&
            <tbody className="bg-white divide-y divide-teal-100">
              {filteredProducts.map((product, index) => (
                <tr key={product._id} className="hover:bg-teal-50 cursor-pointer text-sm">
                  <td className="px-6 font-medium text-gray-900">
                    <img src={product?.image[0]} className='w-7 h-7 border bg-slate-200' alt="" placeholder='image' />
                  </td>
                  <td className=" px-6 font-medium text-gray-900">
                    <Link className='py-3' to={`update-product/${product._id}`} >
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 px-6 text-gray-500 whitespace-nowrap">{product.category.name}</td>
                  <td className=" px-6 text-gray-900" >
                    <div className="flex justify-center items-center gap-4">

                      <button disabled={submitLoad} onClick={() => handleDelete(product._id)} className='hover:text-white hover:bg-red-500 rounded-full p-1 font-normal text-red-500'>
                        <MdDeleteForever className=' w-6 h-6' />
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

export default ProductTable;
