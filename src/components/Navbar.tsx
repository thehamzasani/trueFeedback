'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import Image from 'next/image';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-white text-black">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="flex items-center space-x-2 font-bold text-xl mb-4 md:mb-0">
          {/* Logo */}
          <div className="relative" style={{ width: '50px', height: '50px' }}>
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div className="text-lg flex space-x-1">
            <div style={{ color: '#00C1B0' }}>True</div>
            <div>Feedback</div>
          </div>
        </a>
        {session ? (
          <>
            <span className="mr-4">
              Welcome, {user.username || user.email}
            </span>
            <Button onClick={() => signOut()} style={{ borderColor: '#00C1B0' }} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
              Logout
            </Button>
          </>
        ) : (
          <Link href="/sign-in">
            <Button style={{ borderColor: '#00C1B0' }} className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
