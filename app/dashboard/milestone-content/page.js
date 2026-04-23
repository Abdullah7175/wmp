"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Trash2, Plus, Search, Edit, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function MilestoneContentPage() {
  const { data: session } = useSession();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/milestone-content`);
      if (response.ok) {
        const data = await response.json();
        setContent(data || []);
      }
    } catch (error) {
      console.error('Error fetching milestone content:', error);
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (id) => {
    // 1. Confirmation check (You have this, which is great)
    if (!confirm('Delete this milestone update?')) return;
    
    try {
      // 2. Updated URL to use the path dynamic [id]
      const res = await fetch(`/api/milestone-content/${id}`, { 
        method: 'DELETE' 
      });

      if (res.ok) {
        // 3. Update the UI state immediately so the card disappears
        setContent(prev => prev.filter(item => item.id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete due to a network error');
    }
  };

  const filteredContent = content.filter(item => 
    item.milestone_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.work_request_id?.toString().includes(searchTerm) ||
    item.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMediaUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/uploads/') ? url.replace('/uploads/', '/api/uploads/') : url;
  };

  if (loading) return <div className="flex justify-center items-center h-96">Loading Milestones...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Milestone Progress</h1>
          <p className="text-gray-600">Visual updates for specific work stages</p>
        </div>
        <Link href="/dashboard/milestone-content/add">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" /> Add Milestone
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search by milestone, request ID or address..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredContent.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
           <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
           <p>No milestone progress found.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
            <Card key={item.id} className="overflow-hidden border-slate-200 shadow-sm">
              <div className="relative h-48 bg-slate-100">
                {item.content_type === 'video' ? (
                  <video src={getMediaUrl(item.link)} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={getMediaUrl(item.link)} alt={item.milestone_name} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge className="bg-blue-600">Req #{item.work_request_id}</Badge>
                  <Badge variant="secondary" className="bg-white/90">{item.milestone_name}</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm truncate">{item.description || 'No Description'}</h3>
                
                <div className="flex items-center justify-between mt-4 border-t pt-3">
                  <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => window.open(getMediaUrl(item.link))}>
                      <Download className="w-3 h-3" />
                    </Button>
                    <Link href={`/dashboard/milestone-content/edit/${item.id}`}>
                      <Button size="icon" variant="outline" className="h-7 w-7"><Edit className="w-3 h-3" /></Button>
                    </Link>
                    <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}