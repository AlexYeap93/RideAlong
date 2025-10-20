import logo from "./photos/RideAlong.png";

export function AppHeader() {
  return (
    <div className="bg-white p-4 flex items-center justify-center border-[5px] border-primary">
      <img src={logo} alt="RideAlong" className="h-8 w-auto" />
    </div>
  );
}