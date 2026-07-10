
import {Star} from 'lucide-react';
type EntityProps = {
    name: string;
    text: string;
    rating: number;
};

export const SatisfiedEntity = (entity: EntityProps) => {
    return (
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-primary">
                {entity.name.substring(0,2)}
            </div>
            <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="currentColor" className={star <= entity.rating ? "text-secondary" : "text-gray"}/>)}
            </div>
            <p className="text-gray-600 text-sm mb-6">{entity.text}</p>
            <h4 className="font-bold text-blue-900">{entity.name}</h4>
        </div>
    )
};  