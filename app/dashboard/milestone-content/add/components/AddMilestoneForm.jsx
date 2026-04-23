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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle2 } from 'lucide-react';

const validationSchema = Yup.object({
  workRequestId: Yup.number().required('Work Request is required'),
  milestoneId: Yup.number().required('Milestone selection is required'),
  contentType: Yup.string().oneOf(['image', 'video']).required('Content type is required'),
  description: Yup.string().required('Description is required'),
});

const AddMilestoneForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [workRequests, setWorkRequests] = useState([]);
  const [availableMilestones, setAvailableMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // REMOVED 'description' from fileInputs state
  const [fileInputs, setFileInputs] = useState([{ file: null, latitude: '', longitude: '' }]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        setWorkRequests(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Error fetching work requests:', error);
    }
  };

  const handleWorkRequestChange = async (requestId) => {
    formik.setFieldValue('workRequestId', requestId);
    formik.setFieldValue('milestoneId', ''); 
    setAvailableMilestones([]);

    const selectedRequest = workRequests.find(r => r.id.toString() === requestId);
    if (selectedRequest?.nature_of_work) {
      try {
        const response = await fetch(`/api/milestones?nature_of_work=${selectedRequest.nature_of_work}`);
        if (response.ok) {
          const data = await response.json();
          setAvailableMilestones(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      workRequestId: '',
      milestoneId: '',
      contentType: 'image',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (fileInputs.some(input => !input.file)) {
        toast({ title: "Error", description: "Please select a file for all inputs", variant: "destructive" });
        return;
      }

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('work_request_id', values.workRequestId);
        formData.append('milestone_id', values.milestoneId);
        formData.append('content_type', values.contentType);
        
        // This is the main description we want in the DB
        formData.append('description', values.description);

        fileInputs.forEach((input) => {
          formData.append('files', input.file);
          // We send the SAME main description for every file in this upload
          formData.append('descriptions', values.description);
          formData.append('latitudes', input.latitude);
          formData.append('longitudes', input.longitude);
        });

        const response = await fetch('/api/milestone-content', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          toast({ title: "Success", description: "Milestone content uploaded successfully" });
          router.push('/dashboard/milestone-content');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to upload");
        }
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
  });

  const addFileInput = () => setFileInputs([...fileInputs, { file: null, latitude: '', longitude: '' }]);
  const removeFileInput = (index) => setFileInputs(fileInputs.filter((_, i) => i !== index));

  const handleFileChange = (index, file) => {
    if (!file) return;
    const maxSize = formik.values.contentType === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "Invalid File", description: `Max size: ${formik.values.contentType === 'video' ? '100MB' : '5MB'}`, variant: "destructive" });
      return;
    }
    const newInputs = [...fileInputs];
    newInputs[index].file = file;
    setFileInputs(newInputs);
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Add Milestone Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work Request *</Label>
                <Select onValueChange={handleWorkRequestChange} value={formik.values.workRequestId}>
                  <SelectTrigger><SelectValue placeholder="Select Request" /></SelectTrigger>
                  <SelectContent>
                    {workRequests.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        #{r.id} - {r.nature_of_work}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Milestone *</Label>
                <Select 
                  onValueChange={(v) => formik.setFieldValue('milestoneId', v)} 
                  value={formik.values.milestoneId}
                  disabled={!formik.values.workRequestId}
                >
                  <SelectTrigger><SelectValue placeholder="Select Milestone" /></SelectTrigger>
                  <SelectContent>
                    {availableMilestones.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>{m.milestone_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select onValueChange={(v) => formik.setFieldValue('contentType', v)} value={formik.values.contentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description/Address *</Label>
              <Textarea 
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Add Description with area name here..."
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-xs">{formik.errors.description}</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Media Uploads</Label>
                <Button type="button" onClick={addFileInput} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" /> Add More
                </Button>
              </div>

              {fileInputs.map((input, index) => (
                <div key={index} className="p-4 border rounded-lg bg-slate-50/50 space-y-3 relative">
                  {fileInputs.length > 1 && (
                    <Button type="button" onClick={() => removeFileInput(index)} variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                      <Label>File {index + 1}</Label>
                      <Input 
                        type="file" 
                        accept={formik.values.contentType === 'image' ? "image/*" : "video/*"}
                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                      />
                    </div>
                    <div>
                      <Label>Latitude</Label>
                      <Input placeholder="Lat" type="number" step="any" value={input.latitude} onChange={(e) => {
                        const newInputs = [...fileInputs];
                        newInputs[index].latitude = e.target.value;
                        setFileInputs(newInputs);
                      }}/>
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input placeholder="Lng" type="number" step="any" value={input.longitude} onChange={(e) => {
                        const newInputs = [...fileInputs];
                        newInputs[index].longitude = e.target.value;
                        setFileInputs(newInputs);
                      }}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? "Processing..." : "Save Milestone Content"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMilestoneForm;