"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  Building,
  DollarSign,
  Wrench,
  FileText,
  Image,
  MessageSquare,
  AlertCircle
} from "lucide-react";

export default function RequestApprovalForm({ requestData }) {
  const router = useRouter();
  const { request, beforeImages } = requestData;
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comments.trim()) {
      alert("Please add a comment");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/ceo/approve-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workRequestId: request.id,
          comments: comments.trim()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const result = await response.json();
      
      if (result.success) {
        alert("Comment added successfully");
        router.push("/ceo/requests");
      } else {
        throw new Error(result.message || "Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Error submitting comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Request Details Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Work Request #{request.id}
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <MessageSquare className="w-4 h-4 mr-1" />
              CEO Comments
            </span>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {request.complaint_type}
            {request.complaint_subtype && (
              <span className="text-gray-600 font-normal"> - {request.complaint_subtype}</span>
            )}
          </h3>
          
          <p className="text-gray-700 mb-4">{request.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{request.district} - {request.town}</p>
                {request.subtown && (
                  <p className="text-sm text-gray-600">{request.subtown}</p>
                )}
                <p className="text-sm text-gray-600">{request.address}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Contact</p>
                <p className="text-sm text-gray-600">{request.contact_number}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Request Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(request.request_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created By</p>
                <p className="text-sm text-gray-600">{request.creator_name}</p>
                <p className="text-sm text-gray-500">{request.creator_email}</p>
              </div>
            </div>
            
            {request.nature_of_work && (
              <div className="flex items-start space-x-3">
                <Wrench className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Nature of Work</p>
                  <p className="text-sm text-gray-600">{request.nature_of_work}</p>
                </div>
              </div>
            )}
            
            {request.budget_code && (
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Budget Code</p>
                  <p className="text-sm text-gray-600">{request.budget_code}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Before Images Section */}
      {beforeImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Before Images ({beforeImages.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beforeImages.map((image) => (
              <div key={image.id} className="border rounded-lg p-4">
                <img
                  src={image.link}
                  alt="Before image"
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Uploaded by: {image.creator_name}</p>
                  <p className="text-gray-500">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                  {image.description && (
                    <p className="mt-1 text-gray-700">{image.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CEO Comments Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Add CEO Comment
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Comments */}
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
              Comment *
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add your comment about this work request..."
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding Comment..." : "Add Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
