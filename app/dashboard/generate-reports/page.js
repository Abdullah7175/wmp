"use client"
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MapPin, Building2, Landmark, FileStack, Proportions } from 'lucide-react';

const reportOptions = [
  {
    title: "Town-wise Report",
    description: "Generate summaries for specific towns or all towns.",
    icon: MapPin,
    url: "/dashboard/generate-reports/town",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "UC-wise Report",
    description: "Detailed distribution based on Union Councils.",
    icon: Landmark,
    url: "/dashboard/generate-reports/uc",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "District-wise Report",
    description: "Performance and work distribution by districts.",
    icon: Building2,
    url: "/dashboard/generate-reports/district",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Department-wise Report",
    description: "Breakdown of requests handled by different departments.",
    icon: FileStack,
    url: "/dashboard/generate-reports/department",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
  title: "Nature of Work Report",
  description: "Distribution of requests based on Nature of Work categories.",
  icon: Proportions, // or any relevant icon
  url: "/dashboard/generate-reports/nature-of-work",
  color: "text-red-600",
  bgColor: "bg-red-50"
}
];

export default function GenerateReportsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
        <p className="text-gray-600 mt-2">Select the type of report you want to configure and download.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportOptions.map((report) => (
          <Link href={report.url} key={report.title} className="transition-transform hover:scale-105">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4`}>
                  <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <CardTitle className="text-xl">{report.title}</CardTitle>
                <CardDescription className="mt-2">{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-blue-600 group-hover:underline">Configure →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}