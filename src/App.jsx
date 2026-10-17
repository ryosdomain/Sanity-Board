import React, { useLayoutEffect, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

const generator = rough.generator();

const App = () => {
  const [action, setAction] = useState("none");
  const [elements, setElements] = useState([]);
  const [tool, setTool] = useState("line");
  const [selectedElement, setSelectedElement] = useState(null);

  const createElement = (id, x1, y1, x2, y2, tool) => {
    let roughElement;
    const toolType = tool;
    if (tool === "line") {
      // const roughElement = generator.line(x1, y1, x2, y2);
      roughElement = generator.line(x1, y1, x2, y2);
    } else if (tool === "rectangle") {
      roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    } else if (tool === "ellipse") {
      roughElement = generator.ellipse(
        (x1 + x2) / 2, // center X
        (y1 + y2) / 2, // center Y
        x2 - x1, // width
        y2 - y1, // height
      );
    } else if (tool === "circle") {
      const diameter = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      roughElement = generator.circle(x1, y1, diameter);
    } else {
      // selection or unknown tool → don’t create a drawable element
      return null;
    }

    return { id, x1, y1, x2, y2, toolType, roughElement };
  };

  const mouseIsOn = (x, y, element) => {
    // this function returns the selected element based on the toolType of element
    const { x1, y1, x2, y2, toolType } = element;
    const distance = (a, b) => {
      return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    };
    if (toolType === "line") {
      const a = { x: x1, y: y1 };
      const b = { x: x2, y: y2 };
      const c = { x, y };

      const offset = distance(a, b) - (distance(a, c) + distance(b, c));

      return Math.abs(offset) < 1;
    } else if (toolType === "rectangle") {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    } else if (toolType === "circle") {
      const diameter = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      const radius = diameter / 2;
      const center = { x: x1, y: y1 };
      const mouse = { x, y };

      return distance(center, mouse) <= radius;
    } else if (toolType === "ellipse") {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;

      if (rx === 0 || ry === 0) return false; // avoid dividing by zero

      const value =
        Math.pow(x - cx, 2) / Math.pow(rx, 2) +
        Math.pow(y - cy, 2) / Math.pow(ry, 2);

      return value <= 1;
    }
  };
  const selectElementAtPosition = (x, y, elements) => {
    return elements.find((element) => mouseIsOn(x, y, element)); // on click selects the element on which mouse is on
  };

  // this function updates elements

  const updateElement = (id, x1, y1, x2, y2, toolType) => {
    const updateElement = createElement(id, x1, y1, x2, y2, toolType);

    const elementsCopy = [...elements];
    elementsCopy[id] = updateElement;

    setElements(elementsCopy);
  };

  // this handle mosing down event

  const handleMouseDown = (e) => {
    const { clientX, clientY } = e;
    if (tool === "selection") {
      const element = selectElementAtPosition(clientX, clientY, elements);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;

        setSelectedElement({ ...element, offsetX, offsetY });

        setAction("moving");
      }
    } else {
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
      );
      setElements((prev) => [...prev, element]);

      setAction("drawing");
    }
  };

  // this handle mouse moving event

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];

      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      const { id, x1, y1, x2, y2, toolType, offsetX, offsetY } =
        selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;

      const newX = clientX - offsetX;
      const newY = clientY - offsetY;

      updateElement(id, newX, newY, newX + width, newY + height, toolType);
    }
  };

  // this handle mouse up event

  const handleMouseUp = () => {
    setSelectedElement(null);
    setAction("none");
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
            setTool("selection");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${tool === "selection" ? "bg-violet-300" : ""}`}
        >
          Selection
        </button>
        <button
          onClick={() => {
            setTool("line");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${tool === "line" ? "bg-violet-300" : ""}`}
        >
          Line
        </button>
        <button
          onClick={() => {
            setTool("rectangle");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${tool === "rectangle" ? "bg-violet-300" : ""}`}
        >
          Rectangle
        </button>
        <button
          onClick={() => {
            setTool("ellipse");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${tool === "ellipse" ? "bg-violet-300" : ""}`}
        >
          Ellipse
        </button>
        <button
          onClick={() => {
            setTool("circle");
          }}
          className={`border px-3 py-1 rounded-lg mr-2 ${tool === "circle" ? "bg-violet-300" : ""}`}
        >
          Circle
        </button>
        <button
          onClick={() => {
            setElements([]);
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
