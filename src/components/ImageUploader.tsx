import React from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageUploaderProps {
  bucket: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ bucket, images = [], onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError('');
      if (!e.target.files || e.target.files.length === 0) return;
      
      const files: File[] = Array.from(e.target.files);
      if (images.length + files.length > maxImages) {
        setError(`You can only upload up to ${maxImages} images.`);
        return;
      }

      setUploading(true);
      const newImages: string[] = [];

      for (const file of files) {
        // Simple file validation
        if (!file.type.startsWith('image/')) {
          throw new Error('Only images are allowed');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size must be less than 5MB');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) {
          if (uploadError.message === 'Bucket not found' || uploadError.message.includes('not found')) {
            throw new Error(`The storage bucket "${bucket}" does not exist in your Supabase project. Please run the updated supabase-schema.sql in your Supabase SQL editor to create it, or manually create a public bucket named "${bucket}".`);
          }
          throw uploadError;
        }

        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        newImages.push(data.publicUrl);
      }

      onChange([...images, ...newImages]);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = ''; // Reset input
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    // Note: This only removes from the UI/database reference.
    // For a production app, you might also want to delete the file from Supabase storage.
    const newImages = images.filter((_, i) => i !== indexToRemove);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-400 text-sm">{error}</div>}
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className={cn(
            "aspect-square rounded-xl border-2 border-dashed border-neutral-700 hover:border-lime-500 hover:bg-lime-500/5 transition-colors cursor-pointer flex flex-col items-center justify-center text-neutral-400 hover:text-lime-500",
            uploading && "opacity-50 pointer-events-none"
          )}>
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
              <span className="text-xs font-medium">
                {uploading ? 'Uploading...' : 'Upload Image'}
              </span>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple={maxImages > 1}
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-neutral-500">
        JPEG, PNG or WEBP up to 5MB. {images.length}/{maxImages} uploaded.
      </p>
    </div>
  );
}
