import "./loading.scss";

export default function () {
  const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  wrapper.classList.add("loading-wrapper");
  wrapper.setAttribute("viewBox", "0 0 100 100");

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );

  circle.setAttribute("cx", "50");
  circle.setAttribute("cy", "50");
  circle.setAttribute("r", "50");

  wrapper.appendChild(circle);

  const set = (value) => {
    circle.style.strokeDashoffset = -315 + value * 315 + "px";
  };

  const remove = () => {
    wrapper.remove();
  };

  return {
    wrapper,
    set,
    remove,
  };
}
