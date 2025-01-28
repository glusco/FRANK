import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  const [message, setMessage] = useState('Awaiting server response...');
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.text();
          setMessage(data);
          setError('');
        } else {
          setError(`Failed to connect. Status: ${response.status}`);
        }
      } catch (err) {
        setError(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    checkConnection();
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>FRANK - Student Q&A Platform</title>
        <meta name="description" content="A platform for students to ask and answer questions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to FRANK
        </h1>
        
        <div className="max-w-2xl mx-auto">
          {error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-700">{message}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home; 