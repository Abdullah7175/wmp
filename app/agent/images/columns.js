"use client"

import { MoreHorizontal, MapPin, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
// Using regular img tag instead of Next.js Image for better special character handling

export const columns = [
  {
    accessorKey: "work_request_id",
    header: "Work Request ID",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "geo_tag",
    header: "Location",
    cell: ({ row }) => {
      const geoTag = row.original.geo_tag;
      const lat = row.original.latitude;
      const lng = row.original.longitude;

      // Handle GeoJSON { coordinates: [lng, lat] }
      if (geoTag && typeof geoTag === 'object' && geoTag.coordinates) {
        const [lng, lat] = geoTag.coordinates;
        return (
          <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </a>
        );
      }
      // Handle string format "lat,lng" or "lng,lat"
      if (geoTag && typeof geoTag === 'string') {
        let parts = geoTag.split(',').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          // Try both orders
          let lat1 = parts[0], lng1 = parts[1];
          let lat2 = parts[1], lng2 = parts[0];
          // Prefer lat/lng in valid ranges
          if (lat1 >= -90 && lat1 <= 90 && lng1 >= -180 && lng1 <= 180) {
            return (
              <a href={`https://www.google.com/maps?q=${lat1},${lng1}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Map
                </Button>
              </a>
            );
          } else if (lat2 >= -90 && lat2 <= 90 && lng2 >= -180 && lng2 <= 180) {
            return (
              <a href={`https://www.google.com/maps?q=${lat2},${lng2}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Map
                </Button>
              </a>
            );
          }
        }
      }
      // Handle separate lat/lng fields
      if (lat && lng) {
        return (
          <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </a>
        );
      }
      return <span className="text-gray-400">No location</span>;
    },
  },
  {
    accessorKey: "link",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original;
      return (
        <div className="relative w-16 h-16">
          <img
            src={image.link}
            alt={image.description || 'Work request image'}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
            style={{ display: 'none' }}
          >
            No Image
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Uploaded On",
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return date.toLocaleDateString();
    },
  },
]
  {
    accessorKey: "created_at",
    header: "Uploaded On",
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return date.toLocaleDateString();
    },
  },
]