"use client";

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Edit3, ArrowLeft, Loader2, MapPin, Upload, FileJson } from 'lucide-react';

const validationSchema = Yup.object({
  description: Yup.string().required('Description is required'),
  latitude: Yup.number().required('Latitude is required'),
  longitude: Yup.number().required('Longitude is required'),
});

const UpdateMilestoneForm = ({ id }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meta, setMeta] = useState({ reqId: '', milestone: '', type: '', link: '' });
  const [newFile, setNewFile] = useState(null);

  const getMediaUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/uploads/') ? url.replace('/uploads/', '/api/uploads/') : url;
  };

  const formik = useFormik({
    initialValues: {
      description: '',
      latitude: '',
      longitude: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('description', values.description);
        formData.append('latitude', values.latitude);
        formData.append('longitude', values.longitude);
        
        if (newFile) {
          formData.append('file', newFile);
        }

        const response = await fetch(`/api/milestone-content/${id}`, {
          method: 'PUT',
          // Note: Do not set Content-Type header when sending FormData
          body: formData,
        });

        if (response.ok) {
          toast({ title: "Updated", description: "Progress entry saved successfully" });
          router.push('/dashboard/milestone-content');
          router.refresh();
        } else {
          const errData = await response.json();
          throw new Error(errData.error || "Update failed");
        }
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/milestone-content/${id}`);
        if (!res.ok) throw new Error("Failed to load data");
        const data = await res.json();

        setMeta({
          reqId: data.work_request_id,
          milestone: data.milestone_name,
          type: data.content_type,
          link: data.link
        });

        formik.setValues({
          description: data.description || '',
            latitude: data.latitude !== undefined ? data.latitude : '', 
            longitude: data.longitude !== undefined ? data.longitude : '',
        });
      } catch (err) {
        toast({ title: "Error", description: "Failed to load milestone data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-slate-200">
      <CardHeader className="bg-slate-50/80 border-b flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Edit3 className="w-5 h-5" /> Edit Progress Entry
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Req #{meta.reqId}</Badge>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">{meta.milestone}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Existing Media Preview */}
        <div className="space-y-2">
          <Label className="text-slate-500 text-xs font-bold uppercase">Current Media</Label>
          <div className="relative rounded-lg overflow-hidden border bg-slate-100 aspect-video max-h-60 flex items-center justify-center">
            {meta.type === 'video' ? (
              <video src={getMediaUrl(meta.link)} className="w-full h-full object-contain" controls />
            ) : (
              <img src={getMediaUrl(meta.link)} alt="Current" className="w-full h-full object-contain" />
            )}
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* File Upload Replacement */}
          <div className="space-y-2">
            <Label className="text-blue-700 font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4" /> Replace Media (Optional)
            </Label>
            <Input 
              type="file" 
              accept={meta.type === 'video' ? "video/*" : "image/*"}
              onChange={(e) => setNewFile(e.target.files[0])}
              className="cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">Leave blank to keep the current {meta.type}.</p>
          </div>

          <div className="space-y-2">
            <Label>Description / Remarks</Label>
            <Textarea 
              {...formik.getFieldProps('description')} 
              className="min-h-[100px] bg-slate-50/30"
              placeholder="Update progress details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-slate-600"><MapPin className="w-3 h-3"/> Latitude</Label>
              <Input type="number" step="any" {...formik.getFieldProps('latitude')} className="bg-slate-50/30" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-slate-600"><MapPin className="w-3 h-3"/> Longitude</Label>
              <Input type="number" step="any" {...formik.getFieldProps('longitude')} className="bg-slate-50/30" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : "Update Progress"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateMilestoneForm;