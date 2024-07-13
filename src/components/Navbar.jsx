import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <section className='bg-white shadow sticky top-0 left-0'>
            <nav className='container mx-auto flex justify-between items-center py-4 text-slate-900'>
                <Link to={""} className='font-semibold text-teal-500 text-xl'>Foton<span className='text-black'>Optix</span></Link>
                <ul className='flex justify-between gap-5 font-medium text-base'>
                    <Link className='hover:text-teal-500' to={""}>Products</Link>
                    <Link className='hover:text-teal-500' to={"/create-product"}>Create Product</Link>
                </ul>
            </nav>
        </section>
    )
}

export default Navbar