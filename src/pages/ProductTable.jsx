import React, { useEffect, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { Link } from 'react-router-dom';

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState('');

  useEffect(() => {
    setIsLoading(true)
    fetch('http://localhost:8000/api/product?pageSize=1000&currentPage=1')
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
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>
      
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
            </tr>
          </thead>
          
          {!isLoading && 
          <tbody className="bg-white divide-y divide-teal-100">
            {filteredProducts.map((product, index) => (
              <tr key={product._id} className="hover:bg-teal-50 cursor-pointer text-sm">
                <td className="px-6 font-medium text-gray-900">
                  <img src={product?.image[0]} className='w-7 h-7 border bg-slate-200' alt="" placeholder='image'/>
                </td>
                <td className="py-3 px-6 font-medium text-gray-900">{product.name}</td>
                <td className="py-3 px-6 text-gray-500 whitespace-nowrap">{product.category.name}</td>
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
