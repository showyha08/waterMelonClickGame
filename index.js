function main() {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas);
  const initialTime = 10;
  const initialPoint = 0;
  const maxCoordinate = 9;
  const groundWidth = 25;
  const groundHight = 25;
  const groundSubdivisions = 20;
  let melonDisplayTime = 1;

  function createScene() {
    const scene = new BABYLON.Scene(engine);
    // babylon.jsでGUI使う
    const advancedTexture =
      BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // 初期設定
    let timeLimit = initialTime;
    let point = initialPoint;
    let startFlg = false;

    // スコア表示
    const scoreBlock = new BABYLON.GUI.TextBlock();
    scoreBlock.text = point + "pt";
    scoreBlock.fontSize = 20;
    scoreBlock.top = -300;
    scoreBlock.paddingRight = "60%";
    scoreBlock.color = "black";
    advancedTexture.addControl(scoreBlock);

    // カウントダウン表示
    const timerblock = new BABYLON.GUI.TextBlock();
    timerblock.text = "Time:" + timeLimit;
    timerblock.fontSize = 20;
    timerblock.top = -300;
    timerblock.paddingLeft = "60%";
    timerblock.color = "black";
    advancedTexture.addControl(timerblock);

    // ガイドテキスト表示
    const guideblock = document.createElement("p");
    guideblock.textContent = "click watermelon to game start";
    guideblock.style.top = "17rem";
    guideblock.style.left = "4rem";
    guideblock.style.color = "white";
    guideblock.style.fontSize = "large";
    guideblock.style.position = "absolute";
    document.body.appendChild(guideblock);

    // リセットボタン表示
    const restartButtom = BABYLON.GUI.Button.CreateSimpleButton(
      "Reset",
      "Reset"
    );
    restartButtom.width = "150px";
    restartButtom.height = "40px";
    restartButtom.top = "25%";
    restartButtom.color = "white";
    restartButtom.cornerRadius = 20;
    restartButtom.background = "green";

    // カメラとライトの設定
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
    camera.lowerRadiusLimit = 5;
    camera.upperBetaLimit = Math.PI / 2.4;

    // スカイボックスの設定
    // 立方体の内側の面にテクスチャを貼り付ける
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

    // 砂浜
    const sandyBeach = new BABYLON.StandardMaterial("sandyBeach");
    sandyBeach.diffuseTexture = new BABYLON.Texture(
      "./textures/sandyBeach.jpeg"
    );

    // subdivisions の値が大きいほど、グラデーションが細かくなります。
    const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
      "ground",
      "./textures/sandyBeach.jpeg",
      {
        width: groundWidth,
        height: groundHight,
        subdivisions: groundSubdivisions,
        minHeight: 0,
        maxHeight: 1,
      }
    );
    largeGround.material = sandyBeach;

    // 球体を生成
    const watermelon = BABYLON.MeshBuilder.CreateSphere("watermelon", {});
    watermelon.position.y = 1.05;
    // スイカ柄のテクスチャを貼る
    const watermelonTexture = new BABYLON.StandardMaterial("watermelonTexture");
    watermelonTexture.diffuseTexture = new BABYLON.Texture(
      "./textures/waterMelonPattern.png"
    );
    watermelon.material = watermelonTexture;
    watermelon.actionManager = new BABYLON.ActionManager(scene);
    watermelon.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        function (evt) {
          if (timeLimit > 0) startFlg = true;
          if (!startFlg) return;
          guideblock.style.display = "none";

          // 最大座標の範囲内でスイカを動かす
          watermelon.position.x = getRandomCoordinate(maxCoordinate);
          watermelon.position.z = getRandomCoordinate(maxCoordinate);

          // スコア更新
          point++;
          scoreBlock.text = point + "pt";
          advancedTexture.unRegisterClipboardEvents();
        }
      )
    );

    var animating = null;
    // メロン
    BABYLON.SceneLoader.ImportMeshAsync("", "./meshes/", "melon.babylon").then(
      () => {
        const melon = scene.getMeshByName("melon");
        melon.position.y = 1000;
        const melonTexture = new BABYLON.StandardMaterial("melonTexture");
        melonTexture.diffuseTexture = new BABYLON.Texture(
          "./textures/melonPattern.jpg"
        );
        melon.material = melonTexture;
        melon.actionManager = new BABYLON.ActionManager(scene);
        melon.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            function (evt) {
              if (timeLimit <= 0) return;
              if (!startFlg) return;
              // 最大座標の範囲内でメロンを動かす
              melon.position.x = getRandomCoordinate(maxCoordinate);
              melon.position.z = getRandomCoordinate(maxCoordinate);
              // スコア2倍
              point = point * 2;
              scoreBlock.text = point + "pt";
              advancedTexture.unRegisterClipboardEvents();
              melon.setEnabled(false);
            }
          )
        );
        animating = scene.beginAnimation(melon, 0, 60, true);
        animating.pause()

        // リセットボタンクリック時のイベントを設定
        restartButtom.onPointerUpObservable.add(function () {
          watermelon.position.x = 0;
          watermelon.position.z = 0;
          melon.position.y = 1000;
          point = initialPoint;
          scoreBlock.text = point + "pt";
          timeLimit = initialTime;
          timerblock.text = "Time:" + timeLimit;
          guideblock.textContent = "click watermelon to game start";
          guideblock.style.display = "";
          startFlg = false;
          melon.setEnabled(true);
          advancedTexture.unRegisterClipboardEvents();
        });
        advancedTexture.addControl(restartButtom);

    // カウントダウン
    setInterval(() => {
      if (!startFlg) return;
      if (timeLimit > 0) {
        timerblock.text = "Time:" + --timeLimit;
        advancedTexture.unRegisterClipboardEvents();
      } else {
        startFlg = false;
        guideblock.textContent = "time up!";
        guideblock.style.display = "";
        melon.position.y = 1000;
        animating.pause();
      }
      // 2秒間
      if (timeLimit === melonDisplayTime) {
        melon.position.y = 1.05;
        animating = scene.beginAnimation(melon, 0, 60, false);
      }
    }, 1000);
      }
    );

    function getRandomCoordinate(max) {
      return Math.round(Math.random() * max) - max / 2;
    }

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
