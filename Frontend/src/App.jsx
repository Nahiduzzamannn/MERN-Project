import { useEffect,useState } from "react";
import "./App.css"
import axios from "axios";

function App() {
  const [data,setData] = useState("");
   useEffect(() => {
    axios.get("http://localhost:3000/home").then((res) => {
      console.log(res.data);
      setData(res.data);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <>
      <div>
        <h1 className ='text-3xl font-bold underline'>
          {data}
        </h1>


      </div>
    </>
  )
}

export default App
