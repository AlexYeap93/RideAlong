import universityImage from '../../../components/photos/UofC.jpg';
<<<<<<<< HEAD:frontend/src/features/ride/components/DestinationList.tsx
import type { DestinationListProps } from "../../../serviceInterface";
========
import { DestinationListProps } from "../../../types/index";
>>>>>>>> 4b76f6d4 (refactored profile page, clean up of components):frontend/src/components/DestinationList.tsx
import { UNIVERSITY_DESTINATION } from "../../../types/const";

export function DestinationList({ onDestinationSelect }: DestinationListProps) {
  // Currently only one destination is available for our project
  const destination = UNIVERSITY_DESTINATION;

  return (
    <div className="bg-background p-4">
      <div 
        className="relative rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200"
        onClick={() => onDestinationSelect(destination.name)}
      >
        {/* Background Image */}
        <div className="relative h-60 md:h-90 w-full">
          <img 
            src={universityImage} 
            alt="University of Calgary"
            className="w-full h-full object-cover object-[center_bottom]"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content Box */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Title at top */}
          <div className="text-left">
            <h2 className="text-white text-xl font-semibold drop-shadow-lg">
              University of Calgary
            </h2>
          </div>
          
          {/* Description at bottom */}
          <div className="text-left">
            <p className="text-white/90 text-sm drop-shadow-md">
              {destination.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}