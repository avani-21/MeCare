import React from 'react'
import Image from 'next/image';
import Generl from "../../../public/general.png"
import Gynecologist from "../../../public/gynacologist.png"
import Pediatricians from "../../../public/pediatrition.png"
import Neurologist from "../../../public/neurologist.png" 

function spacialities() {

  const specialities = [
    {
      name: "General physician",
      icon:Generl
    },
    {
      name: "Gynecologist",
      icon: Gynecologist
    },
    {
      name: "Pediatricians",
      icon:Pediatricians
    },
    {
      name: "Neurologist",
      icon:Neurologist
    },
  ];
  

  return (
    <section className="text-center py-10">
      <h2 className="text-3xl font-bold mb-2">Find by Speciality</h2>
      <p className="text-gray-600 mb-6">
        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
      </p>

      <div className="flex justify-center gap-8 flex-wrap">
        {specialities.map((speciality, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-20 h-20 mb-2 relative">
              <Image
                src={speciality.icon}
                alt={speciality.name}
                layout="fill"
                objectFit="contain"
              />
            </div>
            <p className="text-gray-700">{speciality.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default spacialities
