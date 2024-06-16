import { SVG } from '@svgdotjs/svg.js';
import FileSaver from "file-saver";
import html2canvas from "html2canvas";
import ResizeObserver from "resize-observer-polyfill";

document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    home: {
      header: "Hello, I'm Coscorrodrift",
      text: "I'm coscorrodrift (you can call me cosco if you want) and this is my personal website.",
    },
    about: {
      header: "About",
      text: "I'm a big car lover/gearhead, mechanical engineer and professional youtube commentor.",
    },
    now: {
      header: "Now",
      text: "i have a job interview tomorrow, for covering a maternity leave in some kind of consulting position, it'd last like 8 months"
    }
  }
  const WIDTH_FIXED = 1200;
  const HEIGHT_FIXED = 630;
  const MIN_DIST = 24;
  const socialImageSVG = document.querySelector(".social-image");
  const socialImageTitle = document.querySelector(".social-image__title");
  const socialImageMeta = document.querySelector(".social-image__meta");
  const body = document.querySelector('body');

  const saveBtn = document.getElementById("save-btn");
  const alignmentBtn = document.getElementById("r-alignment");
  const colorBtn = document.getElementById("r-colours");
  const shapesBtn = document.getElementById("r-shapes");


  let baseColor;
  let baseColorWhite;
  let baseColorBlack;

  let complimentaryColor1;
  let complimentaryColor2;

  let shapeColors;
  let generate;

  const alignmentOpts = ["flex-start", "flex-end", "center"];

  const shapes = SVG(socialImageSVG).group();
  function createWeightedSelector(items) {
    const weightedArray = [];

    for (const item of items) {
      for (let i = 0; i < item.weight; i++) {
        weightedArray.push(item.value);
      }
    }

    return function () {
      return weightedArray[Math.floor(Math.random() * weightedArray.length)];
    };
  }
  function random(min, max) {
    return Math.random() * (max - min) + min;
  }
  const pairs = [
    [30, 60],
    [120, 240],
    [0, 180],
    [90, 180],
    [150, 210],
  ]
  function randomPairs() {
    return pairs[~~random(0, pairs.length)];
  }

  function setColors() {
    const baseHue = random(0, 360);
    const saturation = random(0, 90);
    const angles = randomPairs();

    baseColor = `hsl(${baseHue}, ${saturation}%, 60%)`;
    baseColorWhite = `hsl(${baseHue}, ${saturation}%, 97%)`;
    baseColorBlack = `hsl(${baseHue}, 95%, 3%)`;

    complimentaryColor1 = `hsl(${baseHue + angles[0]}, ${saturation}%, 60%)`;
    complimentaryColor2 = `hsl(${baseHue + angles[1]}, ${saturation}%, 60%)`;

    shapeColors = [complimentaryColor1, complimentaryColor2, baseColor];

    socialImageSVG.style.background = baseColorWhite;
    socialImageSVG.style.color = baseColorBlack;
    body.style.background = baseColorWhite;
  }
  function relativeBounds(svg, HTMLElement) {
    const { x, y, width, height } = HTMLElement.getBoundingClientRect();

    const startPoint = svg.createSVGPoint();
    startPoint.x = x;
    startPoint.y = y;

    const endPoint = svg.createSVGPoint();
    endPoint.x = x + width;
    endPoint.y = y + height;

    const startPointTransformed = startPoint.matrixTransform(
      svg.getScreenCTM().inverse()
    );
    const endPointTransformed = endPoint.matrixTransform(
      svg.getScreenCTM().inverse()
    );

    return {
      x: startPointTransformed.x,
      y: startPointTransformed.y,
      width: endPointTransformed.x - startPointTransformed.x,
      height: endPointTransformed.y - startPointTransformed.y
    };
  }
  function generateRandomRects(existing) {
    const rects = [...existing];
    const tries = 250;
    const maxShapes = 6;

    for (let i = 0; i < tries; i++) {
      if (rects.length === maxShapes + existing.length) break;

      const size = random(100, 600);

      const rect = {
        x: random(-size, 1200),
        y: random(-size, 630),
        width: size,
        height: size
      };

      if (!rects.some((r) => detectRectCollision(r, rect))) {
        rects.push(rect);
      }
    }

    return rects;
  }

  function detectRectCollision(rect1, rect2, padding = 32) {
    return (
      rect1.x < rect2.x + rect2.width + padding &&
      rect1.x + rect1.width + padding > rect2.x &&
      rect1.y < rect2.y + rect2.height + padding &&
      rect1.y + rect1.height + padding > rect2.y
    );
  }

  function generateShapes() {
    shapes.clear();

    const htmlRects = [
      relativeBounds(socialImageSVG, socialImageTitle),
      relativeBounds(socialImageSVG, socialImageMeta)
    ];

    const rects = generateRandomRects(htmlRects);

    for (const rect of rects.slice(2, rects.length)) {
      drawRandomShape(rect);
    }
  }
  function drawSpeckles(existing) {

    const numTextureShapes = 60 * 60 * 60;
    // Light circles
    const circles = [...existing];
    for (let i = 0; i < numTextureShapes; i++) {
      const x = random(0, WIDTH_FIXED);
      const y = random(0, HEIGHT_FIXED);
      const radius = random(1, 6);
      const width = radius * 2;
      const height = radius * 2;
      const circle = {
        x, y, radius, width, height
      }
      if (!circles.some((r) => detectRectCollision(r, circle))) {
        circles.push(circle);
      }
    }
    for (const circle of circles) {
      const { radius, x, y } = circle;
      let shape = shapes.circle(radius).cx(x).cy(y).fill(randomSpeckleColour());
      shape.node.classList.add('shape');

    }
  }
  function randomSpeckleColour() {
    return shapeColors[~~random(0, shapeColors.length)];
  }
  function generateSpeckles() {
    shapes.clear();

    const htmlRects = [
      relativeBounds(socialImageSVG, socialImageTitle),
      relativeBounds(socialImageSVG, socialImageMeta)
    ];
    drawSpeckles(htmlRects);
  }

  function randomColor() {
    // ~~ === shorthand for Math.floor()
    console.log('colors', random(0, shapeColors.length));
    return shapeColors[~~random(0, shapeColors.length)];
  }

  function drawRandomShape({ x, y, width, height }) {
    const shapeChoices = ["rect", "ellipse", "triangle"];
    let shape;

    switch (shapeChoices[~~random(0, shapeChoices.length)]) {
      case "ellipse":
        shape = shapes.ellipse(width, height).x(x).y(y);
        break;
      case "triangle":
        shape = shapes
          .polygon(`0 ${height}, ${width / 2} 0, ${width} ${height}`)
          .x(x)
          .y(y);
        break;
      default:
        shape = shapes.rect(width, height).x(x).y(y);
    }

    const color = randomColor();

    if (random(0, 1) > 0.25) {
      shape.fill(color);
    } else {
      shape
        .stroke({
          color,
          width: 16
        })
        .fill("transparent");
    }

    shape.node.classList.add("shape");
    shape.rotate(random(0, 90)).scale(0.825);
    shape.opacity(random(0.5, 1));
  }

  // regenerate our shapes and shape positions
  shapesBtn.addEventListener("click", () => {
    generate = randomGenerator();

    generate();
  });

  // set new random color values and update the existing shapes with these colors
  colorBtn.addEventListener("click", () => {
    setColors();

    // find all the shapes in our svg and update their fill / stroke
    socialImageSVG.querySelectorAll(".shape").forEach((node) => {

      if (node.getAttribute("stroke")) {
        node.setAttribute("stroke", randomColor());
      } else {

        node.setAttribute("fill", randomColor());
      }
    });
  });

  // choose random new alignment options and update the CSS custom properties, regenerate the shapes
  alignmentBtn.addEventListener("click", () => {
    socialImageSVG.style.setProperty("--align-text-x", alignmentOpts[~~random(0, alignmentOpts.length)]);
    socialImageSVG.style.setProperty("--align-text-y", alignmentOpts[~~random(0, alignmentOpts.length)]);
    generate();
  });
  document.getElementById('h-start').addEventListener('click', () => {
    socialImageSVG.style.setProperty("--align-text-x", 'flex-start');
    generate();
  })
  document.getElementById('h-center').addEventListener('click', () => {
    socialImageSVG.style.setProperty("--align-text-x", 'center');
    generate();
  })
  document.getElementById('h-end').addEventListener('click', () => {
    socialImageSVG.style.setProperty("--align-text-x", 'flex-end');
    generate();
  })

  document.getElementById('v-start').addEventListener('click', () => {
    socialImageSVG.style.setProperty("--align-text-y", 'flex-start');
    generate();
  })
  document.getElementById('v-center').addEventListener('click', () => {
    socialImageSVG.style.setProperty("--align-text-y", 'center');
    generate();
  })
  document.getElementById('v-end').addEventListener('click', () => {
    socialImageSVG.style.setProperty("--align-text-y", 'flex-end');
    generate();
  })
  // save our social image as a .png file
  saveBtn.addEventListener("click", () => {
    const bounds = socialImageSVG.getBoundingClientRect();

    // on save, update the dimensions of our social image so that it exports as expected
    socialImageSVG.style.width = "1200px";
    socialImageSVG.style.height = "630px";
    socialImageSVG.setAttribute("width", 1200);
    socialImageSVG.setAttribute("height", 630);
    // this fixes an odd visual "cut off" bug when exporting
    window.scrollTo(0, 0);

    html2canvas(document.querySelector(".social-image-wrapper"), {
      width: 1200,
      height: 630,
      scale: 2 // export our image at 2x resolution so it is nice and crisp on retina devices
    }).then((canvas) => {
      canvas.toBlob(function (blob) {
        // restore the social image styles
        socialImageSVG.style.width = "100%";
        socialImageSVG.style.height = "auto";
        socialImageSVG.setAttribute("width", "");
        socialImageSVG.setAttribute("height", "");

        FileSaver.saveAs(blob, "generative-social-image.png");
      });
    });
  });
  function generateCircles() {
    const htmlRects = [
      relativeBounds(socialImageSVG, socialImageTitle),
      relativeBounds(socialImageSVG, socialImageMeta)
    ];
    drawCircles(htmlRects);
  }
  function drawCircles(existing) {
    shapes.clear();
    const numTextureShapes = 1440;
    // Light circles
    const circles = [...existing];
    for (let i = 0; i < numTextureShapes; i++) {
      const x = random(0, WIDTH_FIXED);
      const y = random(0, HEIGHT_FIXED);
      const radius = random(1, 6);
      const width = radius * 2;
      const height = radius * 2;
      const circle = {
        x, y, radius, width, height
      }
      if (!circles.some((r) => detectRectCollision(r, circle))) {
        circles.push(circle);
      }
    }
    const pickColor = createWeightedSelector([
      {
        weight: 60,
        value: "#053043"
      },
      {
        weight: 30,
        value: "#F37247"
      },
      {
        weight: 10,
        value: "#F7C881"
      }
    ]);

    for (const point of circles) {
      const color = pickColor();
      const { x, y } = point;
      let shape = shapes
        .circle(MIN_DIST)
        .cx(x)
        .cy(y)
        .fill(color)
        .scale(random(0, 1));
      shape.node.classList.add('shape');
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    generate();
  });

  resizeObserver.observe(socialImageTitle);
  resizeObserver.observe(socialImageMeta);
  const generators = [generateCircles, generateSpeckles, generateShapes]
  function randomGenerator() {
    return generators[~~random(0, generators.length)];
  }
  setColors();
  generate = randomGenerator();
  generate();
  setCardContents('home');
  const links = [...document.querySelectorAll('.links a')];
  links.map(x => {
    x.addEventListener('click', () => {
      const section = x.dataset.section;
      setCardContents(section);
    })
  })

  function setCardContents(section) {
    socialImageTitle.innerText = sections[section]["header"];
    socialImageMeta.innerText = sections[section]["text"];
  }
})