import { Button } from '@mantine/core';
import { Head, Link } from '@inertiajs/react'
import React from 'react'

const Home = ({ auth }) => {
    console.log(auth.user);
    return (
        <>
            <Head title='Welcome' />
            <div className="bg-gray-50 text-gray-900">
                <div className="min-h-[85vh] flex justify-center items-center">
                    <div className="text-center">
                        <h2 className='text-6xl font-thin text-purple-900 py-2'>Nahar Organics</h2>
                        <p className="text-sm my-6">Admin Panel v1.0</p>
                        {auth.user ?(
                            <Link href="/dashboard">
                                <Button>Dashboard</Button>
                            </Link>
                        ):(
                            <Link href="/login">
                                <Button>Login</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home