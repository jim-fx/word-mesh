import "./toggle.scss";
const element = document.getElementById("toggle");
const favicon = document.getElementById("favicon");

let isLight = false;
let ogUrl = favicon.getAttribute("href");

const setMode = (light: boolean) => {
  isLight = light;
  favicon.setAttribute("href", isLight ? "false" : ogUrl);
  document.body.classList[light ? "add" : "remove"]("mode-light");
  document.body.classList[light ? "remove" : "add"]("mode-dark");
  element.classList[light ? "add" : "remove"]("is-light");
};

if ("color-mode" in localStorage) {
  setMode(localStorage.getItem("color-mode") === "true");
} else {
  if (window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setMode(false);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setMode(true);
    }
  }
}

element.addEventListener("click", () => {
  setMode(!isLight);
  localStorage.setItem("color-mode", isLight + "");
});
