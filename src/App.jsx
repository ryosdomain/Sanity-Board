import React, { useLayoutEffect, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

const generator = rough.generator();

const App = () => {
  const [drawing, setDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const [elementType, setElementType] = useState("line");

  const createElement = (x1, y1, x2, y2, type) => {
    // const roughElement = generator.line(x1, y1, x2, y2);
    let roughElement;
    if (elementType === "line") {
      roughElement = generator.line(x1, y1, x2, y2);
    } else if (elementType === "rectangle") {
      roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    } else if (elementType === "ellipse") {
      roughElement = generator.ellipse(
        (x1 + x2) / 2, // center X
        (y1 + y2) / 2, // center Y
        x2 - x1, // width
        y2 - y1, // height
      );
    } else if (elementType === "circle") {
      const diameter = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      roughElement = generator.circle(x1, y1, diameter);
    }

    return { x1, y1, x2, y2, roughElement };
  };

  const handleMouseDown = (e) => {
    setDrawing(true);

    const { clientX, clientY } = e;

    const element = createElement(
      clientX,
      clientY,
      clientX,
      clientY,
      elementType,
    );
    setElements((prev) => [...prev, element]);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;

    const { clientX, clientY } = e;

    const index = elements.length - 1;
    const { x1, y1 } = elements[index];
    const updateElement = createElement(x1, y1, clientX, clientY, elementType);

    const elementsCopy = [...elements];
    elementsCopy[index] = updateElement;
    setElements(elementsCopy);
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  useLayoutEffect(() => {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    elements.forEach((element) => rc.draw(element.roughElement));
  }, [elements]);

  return (
    <div>
      <div className="fixed top-5 left-5">
        <button
          onClick={() => {
            setElementType("line");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${elementType === "line" ? "bg-violet-300" : ""}`}
        >
          Line
        </button>
        <button
          onClick={() => {
            setElementType("rectangle");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${elementType === "rectangle" ? "bg-violet-300" : ""}`}
        >
          Rectangle
        </button>
        <button
          onClick={() => {
            setElementType("ellipse");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${elementType === "ellipse" ? "bg-violet-300" : ""}`}
        >
          Ellipse
        </button>
        <button
          onClick={() => {
            setElementType("circle");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${elementType === "circle" ? "bg-violet-300" : ""}`}
        >
          Circle
        </button>
        <button
          onClick={() => {
             setElements([])
          }}
          className={`border px-3 py-1 rounded-lg mr-2 active:bg-violet-300`}
        >
          Clear Canvas
        </button>
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        className=""
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
};

export default App;
