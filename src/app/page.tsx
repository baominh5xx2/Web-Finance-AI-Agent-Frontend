'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const express = require('express');
const cors = require('cors');
const app = express();

// Apply CORS middleware - this should be near the top, before your routes
app.use(cors());

// Your other middleware and routes go here

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  
  return null;
}
