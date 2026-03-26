"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Save, Upload, Edit, RefreshCw } from "lucide-react";
import Image from "next/image";

type Slide = {
  type: "image" | "video";
  src: string;
};

type SocialLinks = {
  instagram: string;
  facebook: string;
  twitter: string;
};

export default function AdminCustomizePage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [rootImage, setRootImage] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "",
    facebook: "",
    twitter: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingObj, setUploadingObj] = useState<number | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customization");
      const { data } = await res.json();
      if (data) {
        setSlides(data.heroSlides || []);
        setRootImage(data.rootImage || "");
        setSocialLinks(data.socialLinks || { instagram: "", facebook: "", twitter: "" });
      }
    } catch (error) {
      console.error("Failed to fetch customization");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/customization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroSlides: slides, rootImage, socialLinks }),
      });
      if (res.ok) {
        alert("Customization saved successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save customization.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File, index: number) => {
    if (!file) return;
    try {
      setUploadingObj(index);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const { url, error } = await res.json();

      if (url) {
        if (index === -1) {
          setRootImage(url);
        } else {
          const newSlides = [...slides];
          newSlides[index].src = url;
          // Auto detect basic type from mime
          if (file.type.startsWith("video/")) {
            newSlides[index].type = "video";
          } else {
            newSlides[index].type = "image";
          }
          setSlides(newSlides);
        }
      } else {
        alert(error || "Upload failed");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingObj(null);
    }
  };

  const addSlide = () => {
    setSlides([...slides, { type: "image", src: "" }]);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><RefreshCw className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Home Page Customization</h1>
          <p className="text-gray-500 mt-1">Manage the hero section media and social links.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#1a402d] transition disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
          Hero Section Media
          <button onClick={addSlide} className="text-sm font-normal text-[var(--color-primary)] flex items-center gap-1 hover:underline">
            <Plus size={16} /> Add Media
          </button>
        </h2>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
          {slides.map((slide, index) => (
            <div key={index} className="border rounded-xl p-4 relative group bg-gray-50">
              <button
                onClick={() => removeSlide(index)}
                className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full shadow-md hover:bg-red-200 transition z-10"
              >
                <Trash size={16} />
              </button>

              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative mb-4">
                {slide.src ? (
                  slide.type === "video" ? (
                    <video src={slide.src} className="w-full h-full object-cover" controls />
                  ) : (
                    <Image src={slide.src} alt="Slide media" fill className="object-cover" />
                  )
                ) : (
                  <span className="text-sm text-gray-400">No Media</span>
                )}
                
                {uploadingObj === index && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <RefreshCw className="animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <select
                    value={slide.type}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[index].type = e.target.value as "image" | "video";
                      setSlides(newSlides);
                    }}
                    className="border rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUpload(e.target.files[0], index);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="bg-white border shadow-xs px-3 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-gray-50 transition">
                      <Upload size={14} /> Upload
                    </button>
                  </div>
                </div>
                
                <input
                  type="text"
                  placeholder="Or paste media URL"
                  value={slide.src}
                  onChange={(e) => {
                    const newSlides = [...slides];
                    newSlides[index].src = e.target.value;
                    setSlides(newSlides);
                  }}
                  className="w-full text-sm border rounded px-3 py-2 bg-white"
                />
              </div>
            </div>
          ))}
          {slides.length === 0 && (
            <p className="text-gray-500 text-sm col-span-2 text-center py-10">No slides configured. Add one!</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Our Roots Section (About)</h2>
        <div className="border rounded-xl p-4 bg-gray-50 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/3 aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
            {rootImage ? (
              <Image src={rootImage} alt="Root Image" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
            )}
            {uploadingObj === -1 && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <RefreshCw className="animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUpload(e.target.files[0], -1);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="bg-white border shadow-xs px-4 py-2 rounded text-sm flex items-center gap-2 hover:bg-gray-50 transition w-max">
                <Upload size={16} /> Upload New Image
              </button>
            </div>
            <input
              type="text"
              placeholder="Or paste image URL"
              value={rootImage}
              onChange={(e) => setRootImage(e.target.value)}
              className="w-full text-sm border rounded px-3 py-2 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Connect With Us (Social Links)</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Instagram URL</label>
            <input
              type="text"
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-xl border focus:border-[var(--color-primary)] outline-hidden transition"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Facebook URL</label>
            <input
              type="text"
              value={socialLinks.facebook}
              onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-xl border focus:border-[var(--color-primary)] outline-hidden transition"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Twitter URL</label>
            <input
              type="text"
              value={socialLinks.twitter}
              onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-xl border focus:border-[var(--color-primary)] outline-hidden transition"
              placeholder="https://twitter.com/..."
            />
          </div>
        </div>
      </div>
      
    </div>
  );
}
