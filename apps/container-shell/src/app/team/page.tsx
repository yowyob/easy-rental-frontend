import React from 'react';
import { Github, Linkedin, Mail, Code, Database, Layout, Smartphone, Server } from 'lucide-react';
import Image from 'next/image';

// Composant Carte Membre
const TeamMember = ({ name, role, img, icon, linkedin, github, email }: { name: string, role: string, img: string, icon: React.ReactNode, linkedin: string, github: string, email: string }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
        <div className="h-24 bg-gradient-to-r from-primary to-blue-500 relative">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 p-4 rounded-full border-4 border-white overflow-hidden bg-primary">
                    <Image src={img} alt={name} fill className="object-cover rounded-full" />
                </div>
                <div className="absolute bottom-0 right-0 bg-orange-500 text-white p-1 rounded-full border-2 border-white">
                    {icon}
                </div>
            </div>
        </div>
        <div className="pt-16 pb-6 px-6 text-center">
            <h3 className="text-xl font-bold text-slate-800">{name}</h3>
            <p className="text-orange-500 font-medium text-sm mb-4">{role}</p>
            <p className="text-gray-500 text-sm mb-6">{"Passionné par l'innovation et la création de solutions qui simplifient la vie quotidienne."}</p>
            
            <div className="flex justify-center space-x-4 text-gray-400">
                <a href={`https://www.linkedin.com/in/${linkedin}`} className="hover:text-blue-700 transition" target="_blank" rel="noopener noreferrer"><Linkedin size={18}/></a>
                <a href={`https://github.com/${github}`} className="hover:text-black transition" target="_blank" rel="noopener noreferrer"><Github size={18}/></a>
                <a href={`mailto:${email}`}  className="hover:text-blue-400 transition" target="_blank" rel="noopener noreferrer"><Mail size={18}/></a>
            </div>
        </div>
    </div>
);

export default function TeamPage() {
    const email = process.env.NEXT_PUBLIC_RECRUITMENT_EMAIL;
    const TeamMembers = [
        { 
            name : "P. DJOTIO T.",
            role: "Lead of project" , 
            img: "/team/worker.jpg", 
            icon: <Code size={14}/>,
            linkedin: "",
            github: "",
            email: ""
        },
         { 
            name : "NGUEPSSI B.",
            role: "Lead Developer" , 
            img: "/team/worker.jpg", 
            icon: <Code size={14}/>,
            linkedin: "",
            github: "",
            email: ""
        },
         { 
            name : "HASSANA Z.",
            role: "Backend Engineer" , 
            img: "/team/worker.jpg", 
            icon: <Server size={14}/>,
            linkedin: "",
            github: "",
            email: ""
        },
         { 
            name : "NTYE EBO'O N.",
            role: "Fullstack Developer" , 
            img: "/team/worker.jpg", 
            icon: <Layout size={14}/>,
            linkedin: "",
            github: "",
            email: ""
        },
         { 
            name : "NGOM C.",
            role: "UX/UI Designer" , 
            img: "/team/worker.jpg", 
            icon: <Database size={14}/>,
            linkedin: "christine-carelle-ngom-4390262a0/",
            github: "cngomc1",
            email: "ngom24christine03@gmail.com"
        },
         { 
            name : "VUIDE OUENDEU J.",
            role: "Mobile Developer" , 
            img: "/team/worker.jpg", 
            icon: <Smartphone size={14}/>,
            linkedin: "",
            github: "",
            email: ""
        },
    ]
  return (
    <main className="min-h-screen bg-gray-50 text-slate-800 font-sans">

        {/* Hero */}
        <section className="py-20 px-4 text-center container mx-auto">
            <p className="text-orange-500 font-bold  tracking-widest mb-2">Les créateurs</p>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">{"Rencontrez l'équipe de développement"}</h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                {"Une équipe dédiée d'ingénieurs et de designers travaillant ensemble depuis le Cameroun pour révolutionner la location de véhicules."}
            </p>
        </section>

        {/* Team Grid */}
        <section className="container mx-auto px-4 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {
                    TeamMembers.map((member, index) => (
                        <TeamMember 
                            key={index} 
                            name={member.name}
                            role={member.role}
                            img={member.img}
                            icon={member.icon}
                            linkedin={member.linkedin}
                            github={member.github}
                            email={member.email}
                        />
                    ))
                }
            </div>
        </section>
        <div className="flex justify-center pb-16">
             <a href={`mailto:${email}`}
                className="bg-orange-500 text-white px-4 py-4 rounded-lg font-bold text-sm inline-block"
                >
                Join the team
                </a>
        </div>
    </main>
  );
}