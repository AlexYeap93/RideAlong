import { MapPin } from "lucide-react";
// On Home page
export function LocationHeader() {
  return (
    <div className="bg-white shadow-sm border-b p-4">
      <div className="flex items-center gap-3">
        <div className="bg-green-100 p-2 rounded-full">
          <MapPin className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Current Location</p>
          <p className="font-medium">Calgary, AB</p>
        </div>
      </div>
    </div>
  );
}