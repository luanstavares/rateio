// Local Components
import HomeIcons from './home-icons';
import Illustration from './illustration';

export default function Drawings() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <Illustration className="h-[270px] w-[270px] sm:h-[350px] sm:w-[350px] opacity-30 md:h-[430px] md:w-[430px] lg:h-[520px] lg:w-[520px] xl:h-[600px] xl:w-[600px]" />
      <HomeIcons className="h-[170px] w-[170px] opacity-50 sm:h-[225px] sm:w-[225px] md:h-[300px] md:w-[300px] lg:h-[320px] lg:w-[320px] xl:h-[350px] xl:w-[350px]" />
    </div>
  );
}
