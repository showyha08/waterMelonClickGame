function main() {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas);
  const initialTime = 3;
  const initialPoint = 0;
  let timeLimit = initialTime;
  let point = initialPoint;
  let startFlg = false;
  function createScene() {
    const scene = new BABYLON.Scene(engine);
    // GUI
    var advancedTexture =
      BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // スコア
    var scoreBlock = new BABYLON.GUI.TextBlock();
    scoreBlock.text = point + "pt";
    scoreBlock.fontSize = 20;
    scoreBlock.top = -220;
    scoreBlock.left = -300;
    scoreBlock.color = "black";
    advancedTexture.addControl(scoreBlock);

    // カウントダウン
    var timerblock = new BABYLON.GUI.TextBlock();
    timerblock.text = "Time:" + timeLimit;
    timerblock.fontSize = 20;
    timerblock.top = -220;
    timerblock.left = 300;
    timerblock.color = "black";
    advancedTexture.addControl(timerblock);

    var guideblock = document.createElement("p");
    guideblock.textContent = "click watermelon to game start";
    guideblock.style.top = "200px";
    guideblock.style.left = "260px";
    guideblock.style.color = "white";
	guideblock.style.fontSize = "large";
    guideblock.style.position = "absolute";
    document.body.appendChild(guideblock);

    //リセットボタン
    var restartButtom = BABYLON.GUI.Button.CreateSimpleButton("Reset", "Reset");
    restartButtom.width = "150px";
    restartButtom.height = "40px";
    // ボタン位置調整
    restartButtom.top = "210";
    restartButtom.color = "white";
    restartButtom.cornerRadius = 20;
    restartButtom.background = "green";
    restartButtom.onPointerUpObservable.add(function () {
      sphere.position.x = 0;
      sphere.position.z = 0;
      point = initialPoint;
      scoreBlock.text = point + "pt";
      timeLimit = initialTime;
      timerblock.text = "Time:" + timeLimit;
      guideblock.style.display = "";
      advancedTexture.unRegisterClipboardEvents();
    });
    advancedTexture.addControl(restartButtom);

    /**** Set camera and light *****/
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      new BABYLON.Vector3(0, 0, 0)
    );
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 1, 0)
    );
    camera.upperBetaLimit = Math.PI / 2.2;

    const skybox = BABYLON.MeshBuilder.CreateBox(
      "TropicalSunnyDay",
      { size: 150 },
      scene
    );
    const skyboxMaterial = new BABYLON.StandardMaterial(
      "TropicalSunnyDay",
      scene
    );
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      "./textures/TropicalSunnyDay",
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    /**** Materials *****/

    // 砂色の地面
    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseColor = new BABYLON.Color3(0.8, 0.76, 0.63);

    // 砂浜
    const sandyBeach = new BABYLON.StandardMaterial("largeGroundMat");
    sandyBeach.diffuseTexture = new BABYLON.Texture("./textures/sandyBeach.jpeg");

    // subdivisions の値が大きいほど、グラデーションが細かくなります。
    const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
      "ground",
      "./textures/sandyBeach.jpeg",
      { width: 25, height: 25, subdivisions: 20, minHeight: 0, maxHeight: 1 }
    );
    largeGround.material = sandyBeach;

    // スイカ
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {});
    sphere.position.y = 1.05;
    const waterMelonTexture = new BABYLON.StandardMaterial("waterMelonTexture");
    waterMelonTexture.diffuseTexture = new BABYLON.Texture(
      "./textures/waterMelonPattern.png"
    );
    sphere.material = waterMelonTexture;
    sphere.actionManager = new BABYLON.ActionManager(scene);
    sphere.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        function (evt) {
          if (timeLimit > 0) startFlg = true;
          if (!startFlg) return;
          guideblock.style.display = "none";
          const sourceSphere = evt.meshUnderPointer;
          //現在地から
          const max = 9;
          const x = getRandomCoordinate(max);
          const y = getRandomCoordinate(max);

          //スイカを動かす
          sphere.position.x = x;
          sphere.position.z = y;

		  //スコア更新
          point++;
          scoreBlock.text = point + "pt";
          advancedTexture.unRegisterClipboardEvents();
        }
      )
    );

    function getRandomCoordinate(max) {
      return Math.round(Math.random() * max) - max / 2;
	}

	// カウントダウン
    setInterval(() => {
      if (!startFlg) return;
      if (timeLimit > 0) {
        timerblock.text = "Time:" + --timeLimit;
        advancedTexture.unRegisterClipboardEvents();
      } else {
        startFlg = false;
      }
    }, 1000);

    return scene;
  }

  const scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
}
window.addEventListener("DOMContentLoaded", main);
