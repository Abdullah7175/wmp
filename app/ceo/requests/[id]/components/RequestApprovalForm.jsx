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
  Video,
  MessageSquare,
  AlertCircle
} from "lucide-react";

export default function RequestApprovalForm({ requestData }) {
  const router = useRouter();
  const { request, beforeContent, images, videos, finalVideos } = requestData;
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("pending");

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
          comments: comments.trim(),
          approvalStatus: approvalStatus
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
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
      {/* Request Details Card */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-2 lg:space-y-0">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              Work #{request.id}
            </h2>
            <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-blue-100 text-blue-800 w-fit">
              <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
              CEO Comments
            </span>
          </div>
          
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
            {request.complaint_type}
            {request.complaint_subtype && (
              <span className="text-gray-600 font-normal"> - {request.complaint_subtype}</span>
            )}
          </h3>
          
          <p className="text-sm lg:text-base text-gray-700 mb-4">{request.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-900">Location</p>
                <p className="text-xs lg:text-sm text-gray-600">{request.district} - {request.town}</p>
                {request.subtown && (
                  <p className="text-xs lg:text-sm text-gray-600">{request.subtown}</p>
                )}
                <p className="text-xs lg:text-sm text-gray-600">{request.address}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-900">Contact</p>
                <p className="text-xs lg:text-sm text-gray-600">{request.contact_number}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-900">Work Date</p>
                <p className="text-xs lg:text-sm text-gray-600">
                  {new Date(request.request_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-900">Created By</p>
                <p className="text-xs lg:text-sm text-gray-600">{request.creator_name}</p>
                <p className="text-xs lg:text-sm text-gray-500">{request.creator_email}</p>
              </div>
            </div>
            
            {request.nature_of_work && (
              <div className="flex items-start space-x-3">
                <Wrench className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">Nature of Work</p>
                  <p className="text-xs lg:text-sm text-gray-600">{request.nature_of_work}</p>
                </div>
              </div>
            )}
            
            {request.budget_code && (
              <div className="flex items-start space-x-3">
                <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">Budget Code</p>
                  <p className="text-xs lg:text-sm text-gray-600">{request.budget_code}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Before Content Section */}
      {beforeContent.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <Image className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Before Content ({beforeContent.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {beforeContent.map((content) => (
              <div key={content.id} className="border rounded-lg p-3 lg:p-4">
                {content.content_type === 'video' ? (
                  <video
                    src={content.link}
                    className="w-full h-32 lg:h-48 object-cover rounded-md mb-2 lg:mb-3"
                    controls
                  />
                ) : (
                  <img
                    src={content.link}
                    alt="Before content"
                    className="w-full h-32 lg:h-48 object-cover rounded-md mb-2 lg:mb-3"
                  />
                )}
                <div className="text-xs lg:text-sm text-gray-600">
                  <p className="font-medium">Uploaded by: {content.creator_name}</p>
                  <p className="text-gray-500">
                    {new Date(content.created_at).toLocaleDateString()}
                  </p>
                  {content.description && (
                    <p className="mt-1 text-gray-700">{content.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images Section */}
      {images.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <Image className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Images ({images.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg p-3 lg:p-4">
                <img
                  src={image.link}
                  alt="Work image"
                  className="w-full h-32 lg:h-48 object-cover rounded-md mb-2 lg:mb-3"
                />
                <div className="text-xs lg:text-sm text-gray-600">
                  <p className="font-medium">Uploaded by: {image.creator_type}</p>
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

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <Video className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Videos ({videos.length})
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {videos.map((video) => (
              <div key={video.id} className="border rounded-lg p-3 lg:p-4">
                <video
                  src={video.link}
                  controls
                  className="w-full h-32 lg:h-48 object-cover rounded-md mb-2 lg:mb-3"
                />
                <div className="text-xs lg:text-sm text-gray-600">
                  <p className="font-medium">Uploaded by: {video.creator_type}</p>
                  <p className="text-gray-500">
                    {new Date(video.created_at).toLocaleDateString()}
                  </p>
                  {video.description && (
                    <p className="mt-1 text-gray-700">{video.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Videos Section */}
      {finalVideos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <Video className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Final Videos ({finalVideos.length})
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {finalVideos.map((video) => (
              <div key={video.id} className="border rounded-lg p-3 lg:p-4">
                <video
                  src={video.link}
                  controls
                  className="w-full h-32 lg:h-48 object-cover rounded-md mb-2 lg:mb-3"
                />
                <div className="text-xs lg:text-sm text-gray-600">
                  <p className="font-medium">Created by: {video.creator_type}</p>
                  <p className="text-gray-500">
                    {new Date(video.created_at).toLocaleDateString()}
                  </p>
                  {video.description && (
                    <p className="mt-1 text-gray-700">{video.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CEO Comments Form */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">
          Add Comment & Approval
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {/* Approval Status */}
          <div>
            <label htmlFor="approvalStatus" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
              Approval Status *
            </label>
            <select
              id="approvalStatus"
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="not_approved">Not Approved</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label htmlFor="comments" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
              Comment *
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add your comment about this work request..."
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-3 lg:pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-xs lg:text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 lg:px-6 py-2 text-xs lg:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding Comment..." : "Add Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
