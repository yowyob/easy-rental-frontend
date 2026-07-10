import Image from "next/image";
type ServiceProps = {
    img: string;
    title: string;
    description: string;
};

export const ServiceCard = (service: ServiceProps) => {
    return (
       <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border border-gray-100">
            <div className="h-48 overflow-hidden text-secondary text-center">
               <Image src={service.img} alt={service.title} fill className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6 relative">
               <h3 className="text-xl font-bold mb-3 text-slate-800">{service.title}</h3>
               <p className="text-slate-600 mb-6 text-sm leading-relaxed">{service.description}</p>
            </div>
        </div>
    )
};