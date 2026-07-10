'use client';

import Image from 'next/image';
import { StarRating } from './StarRating';

interface TestimonialCardProps {
    name: string;
    photo?: string;
    rating: number;
    comment: string;
    date?: string;
}

export function TestimonialCard({
                                    name,
                                    photo,
                                    rating,
                                    comment,
                                    date,
                                }: TestimonialCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
                {/* Profile Photo */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {photo ? (
                        <Image
                            src={photo}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Name and Rating */}
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{name}</h4>
                    <StarRating rating={rating} size={14} />
                </div>
            </div>

            {/* Comment */}
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                &quot;{comment}&quot;
            </p>

            {/* Date */}
            {date && (
                <p className="text-gray-400 text-xs">
                    {new Date(date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            )}
        </div>
    );
}