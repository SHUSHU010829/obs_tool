export default function Album() {
  return (
    <div className="relative w-full" style={{ height: '180px' }}>
      <div
        className="absolute left-1/2 top-0 h-[400px] w-[600px]"
        style={{ transform: 'scale(0.45) translateX(-50%)', transformOrigin: 'top left' }}
      >
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
    </div>
  );
}
