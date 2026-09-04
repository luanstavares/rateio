// Local Components
import Illustration from "./illustration";
import HomeIcons from "./home-icons";

export default function Drawings() {
  return (
    <>
      <Illustration
        className="h-0 w-0 sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px] xl:h-[600px] xl:w-[600px]"
      />
      <HomeIcons
        className="h-0 w-0 sm:h-[225px] sm:w-[225px] md:h-[300px] md:w-[300px] lg:h-[300px] lg:w-[300px] xl:h-[350px] xl:w-[350px]"
      />
    </>
  );
}
