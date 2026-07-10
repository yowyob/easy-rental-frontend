'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (images.length === 0) {
        return (
            <div className="relative h-96 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-500">Aucune image disponible</span>
            </div>
        );
    }

    return (
        <>
            {/* Main Gallery */}
            <div className="space-y-4">
                {/* Main Image */}
                <div
                    className="relative h-96 rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setIsFullscreen(true)}
                >
                    <Image
                        src={images[currentIndex] || '/client/images/placeholder.jpg'}
                        alt={`${alt} - Image ${currentIndex + 1}`}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrevious();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                            >
                                <ChevronLeft size={24} className="text-gray-800" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNext();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                            >
                                <ChevronRight size={24} className="text-gray-800" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${
                                    index === currentIndex
                                        ? 'ring-2 ring-blue-600'
                                        : 'opacity-70 hover:opacity-100'
                                }`}
                            >
                                <Image
                                    src={image || '/client/images/placeholder.jpg'}
                                    alt={`${alt} - Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
                    onClick={() => setIsFullscreen(false)}
                >
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X size={32} />
                    </button>

                    <div
                        className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[currentIndex] || '/client/images/placeholder.jpg'}
                            alt={`${alt} - Image ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors"
                                >
                                    <ChevronLeft size={32} className="text-white" />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors"
                                >
                                    <ChevronRight size={32} className="text-white" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}