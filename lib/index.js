let x = 0;
let y = 100;
let targets = [];
let move = 0;
let modal;
let modalContent;
let left;
let config;
let canvas;
let block;
let blank;
let result;
let title;

const init = async function (custom = {}) {
  config = { ...defaultConfig, ...custom };
  // 创建一个model;
  // await createModal();
  return new Promise((resolve, reject) => {
    createModal(resolve, reject);
  });
};

// 创建Modal
const createModal = function (resolve) {
  x = random(300, 100);
  y = random(200, 50);
  left = -x + 10;

  modal = createElement("div", modalStyle, "custom-code-modal");

  const modalMaskStyle =
    "width: 100%; height: 100%; background-color:" + config.modal_mask_bgColor;
  const modalMask = createElement("div", modalMaskStyle, "modal_mask");
  document.createElement("div");
  modal.appendChild(modalMask);

  const modalBody = createElement(
    "div",
    "position: fixed; top: 0; left: 0; width: 100%; height: 100%;",
    "modal_body"
  );

  const modalContentStyle =
    "width:" +
    config.modal_width +
    ";height:" +
    config.modal_height +
    ";min-width: 405px; min-height:400px; background-color: #fff;position: absolute; padding: 5px; top:" +
    config.modal_top +
    ";left:" +
    config.modal_left +
    "; transform: translate(-50%, -50%);";

  modalContent = createElement("div", modalContentStyle, "modal_content");

  title = createElement(
    "div",
    "text-align: left; margin-left: 5px; line-height: 40px; position: relative;",
    "modal_title"
  );
  title.innerHTML =
    config.type === "drag"
      ? "请拖动至目标位置"
      : "请依次点击" + targets.join(",");

  const refresh = createElement(
    "div",
    "position: absolute; right: 5px; cursor: pointer;top: 0; color: #1890ff;",
    "modal_refresh"
  );
  refresh.innerHTML = "刷新";
  refresh.onclick = function (e) {
    e.preventDefault();
    reDraw();
  };
  title.appendChild(refresh);
  modalContent.appendChild(title);

  createCanvas();
  draw();
  createResult();
  createSlider(resolve);
  modalBody.appendChild(modalContent);
  modal.appendChild(modalBody);
  document.body.appendChild(modal);
};

const createCanvas = function () {
  canvas = createElement(
    "canvas",
    "width: 400px; height:300px",
    "modal_canvas"
  );
  canvas.width = 400;
  canvas.height = 300;
  canvas.setAttribute("id", "canvas");

  block = createElement(
    "canvas",
    "width: 400px;height:300px;position:absolute;top:45px;left: " + left + "px",
    "block_canvas"
  );
  block.width = 400;
  block.height = 300;
  title.after(canvas);
  canvas.after(block);

  blank = createElement("canvas", "width: 400px; height:300px", "");
  blank.width = 400;
  blank.height = 300;
  const blankContext = blank.getContext("2d");
  blankContext.fillStyle = "transparent";
  blankContext.fillRect(0, 0, 400, 300);
};

const reDraw = async function () {
  modalContent.removeChild(canvas);
  modalContent.removeChild(block);
  x = random(300, 100);
  y = random(200, 50);
  left = -x + 10;
  block.style.left = left + "px";
  await createCanvas();
  draw();
};

const draw = async function () {
  const {
    backgroundColor,
    backgroundImage,
    shape_colors,
    shape_count,
    shape_type,
    shapes,
  } = config;

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, 400, 300);
  block.getContext("2d").clearRect(0, 0, 400, 300);

  // 画背景图
  if (!!backgroundImage) {
    const image = new Image();
    image.onload = function () {
      context.drawImage(image, 0, 0, 400, 300);
    };
    image.src = backgroundImage;
  } else {
    // 颜色背景
    if (typeof backgroundColor === "string" || backgroundColor.length === 1) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, 400, 300);
    } else if (typeof backgroundColor === "object" && backgroundColor.length) {
      const gradient = context.createLinearGradient(0, 0, 400, 300);
      const length = backgroundColor.length;
      backgroundColor.map((c, index) => {
        const stop = index / (length - 1).toFixed(2);
        gradient.addColorStop(stop, c);
      });
      context.fillStyle = gradient;
      context.fillRect(0, 0, 400, 300);
    }
  }

  // 几何图案
  if (shape_count > 0) {
    for (let i = 0; i < shape_count; i++) {
      const shapeIndex = Math.floor(Math.random() * shapes.length);
      const style = shape_colors[i] || generateRGB();
      const shape = shapes[shapeIndex];
      await drawShape(context, shape, style, shape_type);
    }
  }

  drawByType();
};

const drawByType = function () {
  const type = config.targetType;
  switch (type) {
    case "text":
      drawBlankText();
      drawBlockText();
      drawBgText();
      break;
    case "icon":
      drawIcon();
      break;
    default:
      drawBlock();
      drawBg();
      break;
  }
};

const drawIcon = function () {
  const context = blank.getContext("2d");
  context.clearRect(0, 0, 400, 300);
  const image = new Image();
  image.onload = function () {
    context.drawImage(image, x, y, 80, 80);
    drawBlockIcon();
    drawBgIcon();
  };
  image.src = config.target;
};

const drawBlockIcon = function () {  
  const url = canvas.toDataURL("image/jpeg");
  const context = block.getContext("2d");
  const canvasImage = new Image();
  canvasImage.onload = function () {
    context.drawImage(canvasImage, 0, 0);
    const blockImage = context.getImageData(0, 0, 400, 300);
    const blockData = blockImage.data;
    const b = blank.getContext("2d").getImageData(0, 0, 400, 300);
    const data = b.data;
    // 颜色改变
    for (let i = 0; i < 400 * 300; i++) {
      const j = i * 4;
      const r = data[j];
      const g = data[j + 1];
      const b = data[j + 2];
      const a = data[j + 3];
      if (r > 0 || g > 0 || b > 0 || a > 0) {
        data[j] = blockData[j];
        data[j + 1] = blockData[j + 1];
        data[j + 2] = blockData[j + 2];
        data[j + 3] = blockData[j + 3];
      }
    }
    context.clearRect(0, 0, 400, 300);
    context.putImageData(b, 0, 0);
  };
  canvasImage.src = url;
};

const drawBgIcon = function () {
  const context = canvas.getContext("2d");
  const i = context.getImageData(0, 0, 400, 300);
  const data = i.data;
  const blankData = blank.getContext("2d").getImageData(0, 0, 400, 300).data;
  for (let i = 0; i < 400 * 300; i++) {
    const j = i * 4;
    const r = blankData[j];
    const g = blankData[j + 1];
    const b = blankData[j + 2];
    const a = blankData[j + 3];
    if (r > 0 || g > 0 || b > 0 || a > 0) {
      data[j] = 0;
      data[j + 1] = 0;
      data[j + 2] = 0;
      data[j + 3] = 0;
    }
  }
  context.clearRect(0, 0, 400, 300);
  context.putImageData(i, 0, 0);
};

const drawBlockText = function () {
  const url = canvas.toDataURL("image/jpeg");
  const context = block.getContext("2d");
  const canvasImage = new Image();
  canvasImage.onload = function () {
    context.drawImage(canvasImage, 0, 0);
    const blockImage = context.getImageData(0, 0, 400, 300);
    const blockData = blockImage.data;
    const b = blank.getContext("2d").getImageData(0, 0, 400, 300);
    const data = b.data;
    // 颜色改变
    for (let i = 0; i < 400 * 300; i++) {
      const j = i * 4;
      const r = data[j];
      const g = data[j + 1];
      const b = data[j + 2];
      const a = data[j + 3];
      if (r === 0 && g === 0 && b === 0 && a !== 0) {
        data[j] = blockData[j];
        data[j + 1] = blockData[j + 1];
        data[j + 2] = blockData[j + 2];
        data[j + 3] = blockData[j + 3];
      }
    }
    context.clearRect(0, 0, 400, 300);
    context.putImageData(b, 0, 0);
    drawTextBorder();
  };
  canvasImage.src = url;
};

const drawBlock = async function () {
  const url = await canvas.toDataURL("image/jpeg");
  const context = block.getContext("2d");
  drawLine(context);
  // const wholeImage = context.getImageData(0, 0, 400, 300);
  // blockContext.putImageData(wholeImage, 0, 0); 整张都会画进去
  context.clip();
  const blockImage = new Image();
  blockImage.onload = function () {
    context.drawImage(blockImage, 0, 0);
    context.strokeStyle = "rgba(0,0,0,.5)";
    context.lineWidth = 1;
    context.stroke();
  };
  blockImage.src = url;
};

const drawBgText = function () {
  drawText();
};

const drawBg = function () {
  const context = canvas.getContext("2d");
  drawLine(context);
  context.fillStyle = "#fff";
  context.fill();
  const gradient2 = context.createRadialGradient(
    x + 40,
    y + 40,
    0,
    x + 40,
    y + 40,
    70
  );
  gradient2.addColorStop(0, "rgba(0,0,0,0)");
  gradient2.addColorStop(0.2, "rgba(0,0,0,.1)");
  gradient2.addColorStop(0.3, "rgba(0,0,0,.2)");
  gradient2.addColorStop(0.5, "rgba(0,0,0,.45)");
  gradient2.addColorStop(1, "rgba(0,0,0,1)");
  context.fillStyle = gradient2;
  context.fill();
};

const drawBlankText = function () {
  const context = blank.getContext("2d");
  context.clearRect(0, 0, 400, 300);
  context.font = "normal normal 1000 70px 楷体";
  context.fillStyle = "black";
  context.beginPath();
  context.rect(x, y, 80, 80);
  context.lineTo(x + 80, y);
  context.lineTo(x + 80, y + 80);
  context.lineTo(x, y + 80);
  context.closePath();
  context.clip();
  context.fillText(config.target, x, y + 70, 80);
};

const drawTextBorder = function () {
  const context = block.getContext("2d");
  context.font = "normal normal 1000 70px 楷体";
  context.strokeStyle = "rgba(0,0,0,.3)";
  context.beginPath();
  context.rect(x, y, 80, 80);
  context.lineTo(x + 80, y);
  context.lineTo(x + 80, y + 80);
  context.lineTo(x, y + 80);
  context.closePath();
  context.clip();
  context.strokeText(config.target, x, y + 70, 80);
};

const drawText = function (color = "rgba(255,255,255,1)") {
  const context = canvas.getContext("2d");
  context.font = "normal normal 1000 70px 楷体";
  context.fillStyle = color;
  context.shadowColor = "rgba(0,0,0,.5)";
  context.shadowOffsetX = 2;
  context.shadowOffsetY = 2;
  context.shadowBlur = 5;
  context.beginPath();
  context.rect(x, y, 80, 80);
  context.lineTo(x + 80, y);
  context.lineTo(x + 80, y + 80);
  context.lineTo(x, y + 80);
  context.closePath();
  context.clip();
  context.fillText(config.target, x, y + 70, 80);
};

const drawLine = function (context) {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + 30, y);
  context.arc(x + 40, y, 10, -Math.PI, -Math.PI * 2, false);
  context.lineTo(x + 80, y);
  context.lineTo(x + 80, y + 30);
  context.arc(x + 80, y + 40, 10, -Math.PI / 2, -Math.PI * 1.5, false);
  context.lineTo(x + 80, y + 80);
  context.lineTo(x, y + 80);
  context.lineTo(x, y + 30);
  context.arc(x, y + 40, 10, Math.PI / 2, Math.PI * 1.5, true);
  context.closePath();
};

const drawShape = async function (cxt, shape, style, shapeType) {
  const { x, y, w, h, r, a } = generatePosition();
  cxt.fillStyle = style;
  cxt.strokeStyle = style;
  cxt.beginPath();
  switch (shape) {
    case "rect":
      cxt.rect(x, y, w, h);
      break;
    case "circle":
      cxt.arc(x, y, r, 0, Math.PI * 2);
      break;
    case "triangle":
      cxt.moveTo(x, y);
      cxt.lineTo(x + w, y);
      cxt.lineTo(x + w, y + h);
      cxt.closePath();
      break;
    default:
      break;
  }
  if (shapeType === "fill") {
    cxt.fill();
  } else {
    cxt.stroke();
  }
};

const generatePosition = function () {
  const x = random(350);
  const y = random(250);
  const w = random(400);
  const h = random(300);
  const r = random(150);
  const a = random(360);
  return { x, y, w, h, r, a };
};

const generateRGB = function () {
  const r = random(254, 1);
  const g = random(254, 1);
  const b = random(254, 1);
  return `rgb(${r}, ${g}, ${b})`;
};

const random = function (n, min = 0) {
  return Math.floor(Math.random() * (n - min)) + min;
};

const createSlider = function (resolve) {
  const slider = createElement(
    "div",
    "width: 400px; height: 50px; line-height: 50px; margin-top: 10px; position: relative; text-align: center; background: rgba(0,0,0,.1); color: rgba(0,0,0,.3)",
    "modal_slider"
  );
  slider.innerHTML = "拖动滑块完成拼图";

  const sliderBlock = createElement(
    "div",
    "position: absolute; cursor: pointer; top: -1px;left: 0px; width: 80px; display: flex; justify-content: center; align-items: center;height: 52px;background: white; box-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,.3)",
    "slider_button"
  );
  sliderBlock.setAttribute("draggable", true);

  const leftStyle =
    "width: 0; height: 20px; border: 1px solid #1890ff; transition: all 200ms;";
  const centerStyle =
    "width: 0; height: 20px; border: 1px solid #1890ff; transition: all 200ms;margin: 0 4px;";
  const rightStyle =
    "width: 0; height: 20px; border: 1px solid #1890ff; transition: all 200ms;";
  const leftMoveStyle =
    "width: 0; height: 0; border: 4px solid transparent; transition: all 200ms;border-right-color: #1890ff;";
  const rightMoveStyle =
    "width: 0; height: 0; border: 4px solid transparent; transition: all 200ms;border-left-color: #1890ff;";
  const centerMoveStyle =
    "width: 0; height: 0; border: 4px solid #1890ff; boder-radius: 4px; margin: 0 6px; transition: all 200ms;";
  const leftDiv = createElement("div", leftStyle);
  const centerDiv = createElement("div", centerStyle);
  const rightDiv = createElement("div", rightStyle);

  sliderBlock.appendChild(leftDiv);
  sliderBlock.appendChild(centerDiv);
  sliderBlock.appendChild(rightDiv);

  sliderBlock.onmousedown = function (e) {
    const origin = (e || window.event).clientX;
    e.preventDefault();
    leftDiv.style = leftMoveStyle;
    rightDiv.style = rightMoveStyle;
    centerDiv.style = centerMoveStyle;
    sliderBlock.style.cursor = "move";
    window.onmousemove = function (e) {
      const event = e || window.event;
      move = event.clientX - origin;
      move = move > 320 ? 320 : move;
      if (move > 320) {
        move = 320;
      }
      if (move < 0) {
        move = 0;
      }
      sliderBlock.style.left = move + "px";
      block.style.left = left + move + "px";
      window.onmouseup = function (e) {
        leftDiv.style = leftStyle;
        rightDiv.style = rightStyle;
        centerDiv.style = centerStyle;
        sliderBlock.style.cursor = "pointer";
        sliderBlock.style.left = 0;
        block.style.left = left + "px";
        window.onmousemove = false;
        console.log("f", Math.abs(left + e.clientX - origin));
        if (Math.abs(left + e.clientX - origin) < 10) {
          resolve(true);
          result.innerHTML = "验证通过!";
          result.style.background = "#29f329";
          result.style.height = "40px";
          let t = setTimeout(function () {
            document.body.removeChild(modal);
            clearTimeout(t);
          }, 500);
        } else {
          result.innerHTML = "验证未通过!";
          result.style.background = "#bb2f2f";
          result.style.height = "40px";
          let t = setTimeout(function () {
            result.style.height = 0;
            reDraw();
            clearTimeout(t);
          }, 500);
          console.log("验证未通过");
        }
        return false;
      };
    };
  };

  slider.appendChild(sliderBlock);

  modalContent.appendChild(slider);
};

const createResult = function () {
  result = createElement(
    "div",
    "position: absolute; transition:all 200ms; left: 5px; top: 310px; text-align: center; color: #fff; background: #bb2f2f; height: 0; width: 400px;overflow: hidden; line-height: 40px;",
    "model_result"
  );
  result.innerHTML = "验证未通过!";
  modalContent.appendChild(result);
};

const createElement = function (tagName = "div", style, className) {
  const el = document.createElement(tagName);
  el.setAttribute("style", style);
  el.className = className;
  return el;
};

const defaultConfig = {
  type: "drag", // drag or click
  backgroundColor: ["#1890ff", "#00bcd4"],
  backgroundImage: "", // 默认无
  shapes: ["rect", "circle", "triangle", "circle"], // 默认的一些形状
  shape_colors: ["red", "yellow", "green"], // 形状颜色
  shape_type: "fill", // 填充或者线框 line
  shape_count: 10,
  modal_width: "400px",
  modal_height: "420px",
  modal_mask_bgColor: "rgba(0,0,0,.05)",
  modal_left: "50%",
  modal_top: "50%",
  targetType: "default",
  target: "/assets/logo.png",
};

const modalStyle =
  "position: absolute; width: 100vw; height: 100vh; top: 0; left: 0; z-index: 999;";

  export default init;