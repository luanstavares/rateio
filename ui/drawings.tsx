// Local Components
import Illustration from "./illustration";
import HomeIcons from "./home-icons";

export default function Drawings() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <Illustration
        className="h-[270px] w-[270px] opacity-20 sm:h-[350px] sm:w-[350px] sm:opacity-60 md:h-[430px] md:w-[430px] lg:h-[520px] lg:w-[520px] lg:opacity-100 xl:h-[600px] xl:w-[600px]"
      />
      <HomeIcons
        className="h-[170px] w-[170px] opacity-30 sm:h-[225px] sm:w-[225px] sm:opacity-70 md:h-[300px] md:w-[300px] lg:h-[320px] lg:w-[320px] lg:opacity-100 xl:h-[350px] xl:w-[350px]"
      />
    </div>
  );
}
