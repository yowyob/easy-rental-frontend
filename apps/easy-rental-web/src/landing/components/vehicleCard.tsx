import { Heart } from "lucide-react";
import { Button } from "./button";
import Image from "next/image";

export const VehicleCard = ({ }: { img: string; title: string; description: string }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-blue-700">Toyota Cami</h3>
                        <Heart className="text-red-500 fill-current w-5 h-5" />
                      </div>
                      <div className="h-32 mb-4 relative">
                         <Image src="/car_1.webp" fill className="w-full h-full object-contain" alt="Car" />
                         <span className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs px-2 py-1 rounded">Disponible</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2 gap-2">
                         <span> 2 places</span>
                         <span>★ 4.4</span>
                         <span>⛽ 2</span>
                      </div>
                      <div className="text-xl font-bold text-slate-800 mb-4">100 000 CFA/jr</div>
                      <Button variant="secondary" className="w-full py-2">Book Now</Button>
                    </div>
    )
};