const newElement = (nameTag, innerText = "", Attributes = {}) => {
  let newElem = document.createElement(nameTag);
  for (const key in Attributes) {
    newElem.setAttribute(key, Attributes[key]);
  }
  newElem.innerText = innerText;
  return newElem;
};

function AddEmptyCellInCol(tabRows, beg, end) {
  for (let i = beg; i <= end; i++) {
    const empCell = document.createElement("td");
    tabRows[i].appendChild(empCell);
  }
}

function RenderSchedule(schedule) {
  let tabRows = document.querySelectorAll(".tiethoc");
  for (const day in schedule) {
    // loop day by day
    const data = schedule[day];

    if (data.length === 0) {
      AddEmptyCellInCol(tabRows, 0, 9);
    } else {
      let emptyIndex = 0;
      for (const lesson of data) {
        // every lesson in a day
        const { tiet, online, phonghoc, dadk, ngonngu, malop} = lesson;
        const tietBD = Number(tiet.split("-")[0]) - 1,
          tietKT = Number(tiet.split("-")[1]) - 1;

        AddEmptyCellInCol(tabRows, emptyIndex, tietBD - 1);
        let beginCell = document.createElement("td");
        beginCell.className = "text-center table-active border-white align-middle";
        beginCell.setAttribute("rowspan", tietKT - tietBD + 1);
        [
            newElement('h6', `${malop} - ${ngonngu}`),
            newElement('p', `Phòng học: ${phonghoc}`),
            newElement('p', `Sỉ số: ${dadk}`),
            newElement('p', `Hình thức: ${online === '1' ? 'online' : 'offline'}`),
        ].forEach(child => beginCell.appendChild(child));
        tabRows[tietBD].appendChild(beginCell);
        emptyIndex = tietKT + 1;
      }

      AddEmptyCellInCol(tabRows, emptyIndex, 9); // add space until the last period in day
    }
  }
}

function RenderTable() {
  fetch("./logs.json")
    .then((res) => res.json())
    .then((res) => {
      let data = res.data;

      const schedule = {
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
      };

      data.forEach((e) => schedule[e.thu].push(e));
      console.log(schedule);
      RenderSchedule(schedule);
    });
}

document.getElementById("toggle-modal").addEventListener("click", () => {
  RenderTable();
});
