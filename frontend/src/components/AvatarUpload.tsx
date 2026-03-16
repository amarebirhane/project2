"use client";

import React, { useState, useRef } from "react";
import { Camera, Loader2, User, Check, X } from "lucide-react";
import { userService } from "@/services/userService";
import { useToasts } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";

interface AvatarUploadProps {
  currentUrl?: string;
  onUploadSuccess: (newUrl: string) => void;
}

export default function AvatarUpload({ currentUrl, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToasts();
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast("File is too large (max 2MB)", "error");
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const updatedUser = await userService.uploadAvatar(file);
      onUploadSuccess(updatedUser.profile_image_url || "");
      addToast("Profile picture updated!", "success");
      setPreviewUrl(null); // Clear preview for real URL
    } catch (error) {
      console.error("Upload failed", error);
      addToast("Failed to upload image", "error");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative group cursor-pointer"
        onClick={triggerUpload}
      >
        <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative bg-slate-100 dark:bg-slate-800 transition-transform active:scale-95">
          {displayUrl ? (
            <img 
              src={displayUrl} 
              alt="Profile" 
              className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-300">
              <User size={48} />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-primary-600/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <Camera size={24} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
          </div>

          {/* Loading state */}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-20">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          )}
        </div>

        {/* Action button floating */}
        <button 
          className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform z-10"
          type="button"
        >
          <Camera size={18} />
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
      
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
        JPG, PNG or GIF • Max 2MB
      </p>
    </div>
  );
}
