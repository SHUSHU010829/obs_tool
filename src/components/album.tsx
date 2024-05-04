import { FaPlay } from "react-icons/fa6";

export default function Album() {
  return (
    <div className="scale-80 h-[400px] w-[600px] font-montserrat">
      <div className="flex items-center gap-3 pl-20">
        <div className="flex items-center gap-2 rounded bg-[#58585842] px-2 font-mono font-semibold">
          <FaPlay color="#C72C2C" />
          NOW PLAYING
        </div>
      </div>
      <div id="wrap" className="">
        <div id="album">
          <div id="cover">
            <div id="print"></div>
          </div>
          <div id="vinyl">
            <div id="print"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
