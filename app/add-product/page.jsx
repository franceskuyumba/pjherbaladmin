'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AddProduct() {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select a photo!');
    setLoading(true);

    const fileName = ${Date.now()}-;
    const { error: uploadError } = await supabase.storage.from('products').upload(fileName, imageFile);

    if (uploadError) {
      alert(uploadError.message);
      setLoading(false);
      return;
    }

    alert('Product added successfully!');
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
        <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Submit'}</button>
      </form>
    </div>
  );
}
