let value = {};
let historyData = [];
let analyst = {
  Total: 0,
  win: 0,
  lost: 0,
  items1: 0,
  items2: 0,
  items3: 0,
  items4: 0,
  items5: 0,
  items6: 0,
  items7: 0,
};

fetch("./Data/giftcode.json")
  .then((res) => {
    return res.json();
  })
  .then((giftcodeData) => {
    const eventData = localStorage.getItem("eventData");
    if (eventData) {
      const ObjectData = JSON.parse(eventData);
      value = ObjectData;
    } else {
      value = giftcodeData;
    }
  })
  .catch((err) => {
    Swal.fire({
      icon: "error",
      title: "ERROR!",
      text: err,
    });
  });

const eventPlayerData = localStorage.getItem("eventPlayerData");
if (eventPlayerData) {
  const ObjectData = JSON.parse(eventPlayerData);
  historyData = ObjectData;
  UpdateHistory();
}
const eventAnalystData = localStorage.getItem("eventAnalystData");
if (eventAnalystData) {
  const ObjectData = JSON.parse(eventAnalystData);
  analyst = ObjectData;
}

const rewardsData = [
  [1, "Voucher giảm 10%"],
  [2, "Voucher giảm 20%"],
  [3, "Voucher giảm 30%"],
  [4, "Voucher giảm 40%"],
  [5, "Voucher giảm 50%"],
  [6, "Small food or drink"],
  [7, "Chúc bạn may mắn lần sau"],
];
// Epic
const tier1 = [
  [7, 26],
  [1, 21],
  [2, 17],
  [3, 14],
  [4, 10],
  [5, 7],
  [6, 5],
];
// Rare
const tier2 = [
  [7, 40],
  [1, 30],
  [2, 20],
  [3, 10],
];
// Legendary
const tier3 = [
  [2, 35],
  [3, 25],
  [4, 20],
  [5, 15],
  [6, 5],
];

function GetGiftcode() {
  let mssv = document.getElementById("mssv").value.toUpperCase();
  let giftcode = document.getElementById("giftcode").value;

  if (mssv == "" || giftcode == "") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Bạn cần điền đầy đủ thông tin",
    });
    return;
  }
  let valid = false;
  let data = {};
  for (const items in value) {
    if (items == giftcode || items == giftcode.toUpperCase()) {
      valid = true;
      data = value[items];
      break;
    }
  }
  if (valid) {
    const tier = data.tier;
    let result = "";
    let resultImage = "";

    const lastThreeEntries = historyData
      .filter((entry) => entry.mssv === mssv)
      .slice(0, 2);
    const activateInsurance =
      lastThreeEntries.length === 2 &&
      lastThreeEntries.every(
        (entry) => entry.reward === "Chúc bạn may mắn lần sau"
      );
    let insurance = false;

    switch (tier) {
      case "1":
        result = weightedRandom(tier1);
        break;
      case "2":
        result = weightedRandom(tier2);
        break;
      case "3":
        result = weightedRandom(tier3);
        break;
      default:
        Swal.fire({
          icon: "error",
          title: "ERROR!",
          text: `Không tìm thấy tier phần thường cho giftcode ${giftcode}`,
        });
        break;
    }

    if (activateInsurance && result == 7) {
      insurance = true;
    }

    resultImage = result + ".png";
    let resultMessage = "";

    for (const [id, reward] of rewardsData) {
      if (id == result) {
        resultMessage = reward;
        break;
      }
    }

    document.getElementById("mssv").value = "";
    document.getElementById("giftcode").value = "";

    delete value[data.giftcode];
    const JsonData = JSON.stringify(value);
    localStorage.setItem("eventData", JsonData);

    let player = {};
    player = {
      mssv: mssv,
      giftcode: data.giftcode,
      reward: resultMessage,
    };
    historyData.unshift(player);
    if (insurance) {
      player = {
        mssv: mssv,
        giftcode: "BẢO HIỂM",
        reward: "Voucher giảm 10%",
      };
      historyData.unshift(player);
    }

    localStorage.setItem("eventPlayerData", JSON.stringify(historyData));
    UpdateHistory();

    switch (result) {
      case 1:
        analyst.items1++;
        analyst.win++;
        break;
      case 2:
        analyst.items2++;
        analyst.win++;
        break;
      case 3:
        analyst.items3++;
        analyst.win++;
        break;
      case 4:
        analyst.items4++;
        analyst.win++;
        break;
      case 5:
        analyst.items5++;
        analyst.win++;
        break;
      case 6:
        analyst.items6++;
        analyst.win++;
        break;
      case 7:
        analyst.items7++;
        analyst.lost++;
        break;
      default:
        break;
    }
    analyst.Total++;
    localStorage.setItem("eventAnalystData", JSON.stringify(analyst));

    Swal.fire({
      title: "Bạn đã nhận được",
      html: `<img class="img-rewards" src="./Image/Rewards/${resultImage}">`,
    });
    setTimeout(() => {
      if (insurance) {
        Swal.fire({
          title: "Bạn đã nhận bảo hiểm từ chương trình",
          text: "Do bạn đã không trúng 3 lần liên tiếp nên chúng tôi đã cho bạn một bảo hiểm",
          html: `<img class="img-rewards" src="./Image/Rewards/1.png">`,
        });
      }
    }, 2000);
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Giftcode đã được sử dụng hoặc không tồn tại",
    });
  }
}

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item[1], 0);
  let random = Math.random() * totalWeight;

  for (let item of items) {
    if (random < item[1]) {
      return item[0];
    }
    random -= item[1];
  }
}

function UpdateHistory() {
  const history_show = document.getElementById("history-show");
  history_show.innerHTML = "";
  historyData.forEach((items) => {
    const HTMLStructure = `<tr>
                                <td>${items.mssv}</td>
                                <td>${items.giftcode}</td>
                                <td>${items.reward}</td>
                            </tr>`;
    history_show.innerHTML += HTMLStructure;
  });
}
