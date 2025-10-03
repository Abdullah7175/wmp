"use client"
import React, { createContext, useState, useContext } from 'react';

// Create a context
const ComplaintContext = createContext();

// Create a provider component
export const ComplaintProvider = ({ children }) => {
  const [complaint, setComplaint] = useState({ 
    subject: '',
    district_title: '',
    town: '',
    site_location: '',
    size_of_pipe: '',
    length_of_pipe: '',
    allied_items: '',
    associated_work: '',
    survey_date: '',
    completion_date: '',
    geo_tag: '',
    assistant_id: '',
    status: '',
    shoot_date: '',
    complaint_type_id: '',
    complaint_subtype_id: '',
    expenditure_charge: '',
    before_image: '',
    after_image: '',
    link: '',
  });

  // Function to update the user data
  const updateComplaint = (newComplaintData) => {
    setComplaint((prevComplaint) => ({
      ...prevComplaint,
      ...newComplaintData,
    }));
  };

  return (
    <ComplaintContext.Provider value={{ complaint, updateComplaint }}>
      {children}
    </ComplaintContext.Provider>
  );
};

// Custom hook to use the user context
export const useComplaintContext = () => useContext(ComplaintContext);
