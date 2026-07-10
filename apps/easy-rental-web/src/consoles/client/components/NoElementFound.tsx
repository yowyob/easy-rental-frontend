import { LucideIcon } from "lucide-react";

interface NoElementFoundProps {
  icon?: LucideIcon;
  element?: string;
  onButtonClick?: () => void;
 
}
const NoElementFound = ({ icon: Icon, element, onButtonClick }: NoElementFoundProps) => {
    return (  
        <div className="text-center py-12">
              {Icon && (<Icon size={64} className="mx-auto text-gray-300 mb-4" />)}
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No {element} found</h3>
              <p className="text-gray-500">Try changing your search criteria</p>
              <button 
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={onButtonClick}
              >
                Reset filters
              </button>
            </div>  
    )
}

export default NoElementFound;