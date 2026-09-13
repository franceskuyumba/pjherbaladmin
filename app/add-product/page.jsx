
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingRole(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
        setIsAdmin(true);
      }
      setCheckingRole(false);
    }
    checkAdminRole();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select a photo!');
    setLoading(true);

    const fileName = \\-\\;
    const { error: uploadError } = await supabase.storage.from('products').upload(fileName, imageFile);

    if (uploadError) {
      alert('Upload error: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
    const { error: dbError } = await supabase.from('products').insert([{ name, price: parseFloat(price), image_url: publicUrl }]);

    setLoading(false);
    if (dbError) {
      alert('Database error: ' + dbError.message);
    } else {
      alert('Product added successfully with photo!');
      setName('');
      setPrice('');
      setImageFile(null);
    }
  };

  if (checkingRole) return <p className='p-6 text-center'>Checking permissions...</p>;
  if (!isAdmin) return <p className='p-6 text-center text-red-600 font-bold'>Access Denied: Only administrators can add products.</p>;

  return (
    <form onSubmit={handleSubmit} className='p-6 max-w-md mx-auto space-y-4'>
      <h1 className='text-xl font-bold'>Add Product (Admin Only)</h1>
      <input type='text' placeholder='Product Name' value={name} onChange={(e) => setName(e.target.value)} required className='w-full border p-2 rounded' />
      <input type='number' placeholder='Price' value={price} onChange={(e) => setPrice(e.target.value)} required className='w-full border p-2 rounded' />
      <input type='file' accept='image/*' onChange={(e) => setImageFile(e.target.files[0])} required className='w-full border p-2 rounded' />
      <button type='submit' disabled={loading} className='bg-blue-600 text-white px-4 py-2 rounded w-full'>
        {loading ? 'Uploading...' : 'Save Product'}
      </button>
    </form>
  );
}

