export const HeroContent = () => {
  return (
    <div className="text-center text-white">
      <div className="mb-8 flex justify-center">
        <img 
          src="https://c.animaapp.com/mm19g6djl5wbUX/img/uploaded-asset-1771977209008-0.png" 
          alt="CustomPrint DFW" 
          className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
        />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold font-josefin_sans mb-6 drop-shadow-lg">
        Your Vision, Our Craft
      </h1>
      <p className="text-xl md:text-2xl font-montserrat mb-8 max-w-3xl mx-auto drop-shadow-md">
        Professional custom printing services in Terrell, TX. From CNC work to car wraps, we bring your ideas to life.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="#services" 
          className="bg-lime-400 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-lime-300 transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105 duration-200"
        >
          Our Services
        </a>
        <a 
          href="#contact" 
          className="bg-black text-lime-400 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105 duration-200 border-2 border-lime-400"
        >
          Get a Quote
        </a>
      </div>
    </div>
  );
};
