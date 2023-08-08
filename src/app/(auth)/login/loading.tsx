"use client";

import { BounceLoader } from "react-spinners";


const Loading = () => {
  return ( 
    <div className="h-full flex items-center justify-center">
      <BounceLoader color="bg-slate-900" size={40} />
    </div>
  );
}
 
export default Loading;