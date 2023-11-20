import { Bodies, Body, Events, Engine, Render, Runner, World, Collision} from "matter-js";
import { FRUITS_HLW } from "./fruits";

function createWorld(delta) {
  const engine = Engine.create();
  const element = document.createElement('div');
  document.body.appendChild(element);

  const render = Render.create(
    {
      element,
      engine: engine,
      options:{
        // wireframes True하면 물리 엔진 볼 수 있음.
        wireframes: false,
        background: "#F7F4C8",
        width: 620,
        height: 815,
      }
    }
  );

  const world = engine.world;

  // x에서 15, y에서 395만큼 즉 중앙점.
  const leftWall = Bodies.rectangle(15, 385, 30, 810, {
    isStatic: true,
    render: {fillStyle: "#E6B143"}
  });

  const rightWall = Bodies.rectangle(605, 385, 30, 810, {
    isStatic: true,
    render: {fillStyle: "#E6B143"}
  });

  const topLine = Bodies.rectangle(310, 150, 620, 2,{
    name: "topLine",
    isStatic: true,
    isSensor: true,
    render: {fillStyle: "#E6B143"}

  });

  const ground = Bodies.rectangle(310, 820, 620, 60, {
    isStatic: true,
    render: {fillStyle: "#E6B143"}
  });

  World.add(engine.world, [leftWall, rightWall, ground, topLine]);

  // Runner.run(render, engine);
  Render.run(render);
  // Render.run(engine);
  
  let currentBody = null;
  let currentFruit = null;
  let disableAction = false;
  let interval = null;
  let num_suika = 0;
  let gameEnded = false; // 새로운 변수 추가

  const runner = Runner.create();
    const start = Date.now();
    setInterval(() => {
      Runner.tick(runner, engine, Date.now() - start);
    }, delta);


  function adddFruit(){
    //random
    const index = Math.floor(Math.random() * 5);
    const fruit = FRUITS_HLW[index];
    const body = Bodies.circle(300, 50, fruit.radius, {
      index: index,
      //위에서 고정
      isSleeping: true,
      render: {
        sprite: { texture: `${fruit.name}.png` }
      },
      // 탄성 0 ~ 1
      restitution: 0.2,
    });

    currentBody = body;
    currentFruit = fruit;

    World.add(world, body);
  }
  
  window.onkeydown = (event) => {
    if (disableAction || gameEnded) {
      return;
    }
    switch (event.code) {
      case "KeyA":
        if (interval)
          return;

        interval = setInterval(() => {
          if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody,{
            x: currentBody.position.x-1,
            y: currentBody.position.y,
          });
        }, 5)
        
        break;

      case "KeyD":
        if (interval)
          return;

        interval = setInterval(() => {
          if (currentBody.position.x + currentFruit.radius < 590)
          Body.setPosition(currentBody,{
            x: currentBody.position.x+1,
            y: currentBody.position.y,
          });
        }, 5)
        break;

      case "KeyS":
        currentBody.isSleeping = false;
        disableAction = true;

        setTimeout(() => {
          adddFruit();
          disableAction = false;
        }, 1200);
        break;
    }
  }

  window.onkeyup = (event) => {
    switch(event.code){
      case "KeyA":
      case "KeyD":
        clearInterval(interval);
        interval = null;
    }
  }

  const canvas = document.querySelector('canvas');
  const canvasStyle = canvas.style;
  canvasStyle.marginTop = '20px';
  canvasStyle.position = 'absolute';
  canvasStyle.left = '50%';
  canvasStyle.top = '50%';
  canvasStyle.transform = 'translate(-50%, -50%)';

  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      if (!gameEnded) {
        const indexA = collision.bodyA.index;
        const indexB = collision.bodyB.index;
  
        if (indexA === indexB) {
          const index = indexA;
  
          if (index === FRUITS_HLW.length - 1) {
            return;
          }
  
          World.remove(world, [collision.bodyA, collision.bodyB]);
  
          const newFruit = FRUITS_HLW[index + 1];
  
          const newBody = Bodies.circle(
            collision.collision.supports[0].x,
            collision.collision.supports[0].y,
            newFruit.radius,
            {
              render: {
                sprite: { texture: `${newFruit.name}.png` },
              },
              index: index + 1,
            }
          );
  
          World.add(world, newBody);
  
          if (newBody.index === 10) {
            num_suika++;
          }
        }
  
        if (!disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
          endGame("Game Over (Press F5 to Refresh the Page to Restart)");
        } else if (num_suika === 2) {
          endGame("You Win (Press F5 to Refresh the Page to Restart)");
        }
      }
    });
  });

  function endGame(message) {
    alert(message);
    gameEnded = true;
  }

  adddFruit();
}  

createWorld(1000/60)
