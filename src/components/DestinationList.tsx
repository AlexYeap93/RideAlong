import universityImage from 'figma:asset/fa24c410eb5417abe435789bbef39287d0dddb37.png';

interface DestinationListProps {
  searchTerm: string;
  onDestinationSelect: (destination: string) => void;
}

export function DestinationList({ searchTerm, onDestinationSelect }: DestinationListProps) {
  const destination = {
    id: "uofcalgary",
    name: "University of Calgary",
    description: "Main Campus"
  };

  // Check if the search matches University of Calgary
  const isVisible = searchTerm === "" || 
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.description.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="bg-background p-4">
      {isVisible ? (
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
      ) : (
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">No destinations found for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}