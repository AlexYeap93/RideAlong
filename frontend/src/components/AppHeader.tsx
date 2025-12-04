import { Car } from "lucide-react";

export function AppHeader() {
  return (
    <div className="bg-white p-4 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Car className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl text-primary">RideAlong</span>
      </div>
    </div>
  );
}