window.addEventListener("DOMContentLoaded", start);

let endPoint =
  "https://oscarbagger.com/kea/afsluttende_eksamensprojekt/wordpress/wp-json/wp/v2/materiale";
const listContent = document.querySelector("#arkiv_liste");
let materialData = [];
let materials = [];
let activeMaterials = [];

// text in the searchbar
let searchInput = "";

// templates
const tempMat = document.querySelector(".temp_materiale");
const tempSubject = document.querySelector(".temp_materiale_fag");
const tempFilterBox = document.querySelector(".temp_filter_box");
const filterSubject = document.querySelector("#filter_fag");
const filterNiveau = document.querySelector("#filter_niveau");
const filtertypes = document.querySelectorAll(".filter_kategori");
const searchBar = document.querySelector("#searchBar input");
const buttonPrev = document.querySelector("#forrige_side");
const buttonNext = document.querySelector("#næste_side");

const settings = {
  subjectFilter: [],
  niveauFilter: [],
  sortBy: null,
  sortDir: "asc",
  currentPage: 1,
  perPage: 5,
};

const materialListInfo = {
  uniqueSubjects: [],
  uniqueNiveaus: [],
  uniqueActiveSubjects: [],
  uniqueActiveNiveaus: [],
};

const materialeObj = {
  titel: "",
  beskrivelse: "",
  link: "",
  forfatter: "",
  udgiver: "",
  fag: [],
  niveau: [],
  type: "",
};

function start() {
  fetchJson();
}

async function fetchJson() {
  const jsonData = await fetch(endPoint);
  materialData = await jsonData.json();
  prepareObjects(materialData);
}

function prepareObjects(jsonData) {
  materials = jsonData.map(makeObject);
  console.log(materials);
  activeMaterials = materials;
  generateMaterialInfo();
  makeFilterLists();
  makeMaterialList();
  //updatePageButtons();
  addButtonInputs();
}

function addButtonInputs() {
  searchBar.addEventListener("input", () => {
    searchInput = searchBar.value.toLowerCase();
    updateMaterialList();
  });
  /*
  buttonPrev.addEventListener("click", () => {
    settings.currentPage--;
    makeMaterialList();
    updatePageButtons();
    document
      .querySelector("#arkiv_materialeantal")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  });
  buttonNext.addEventListener("click", () => {
    settings.currentPage++;
    makeMaterialList();
    updatePageButtons();
    document
      .querySelector("#arkiv_materialeantal")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }); */
}

function makeObject(jsonObject) {
  let mat = Object.create(materialeObj);
  mat.titel = jsonObject.title.rendered;
  mat.beskrivelse = jsonObject.beskrivelse;
  mat.forfatter = jsonObject.forfatter;
  mat.udgiver = jsonObject.udgiver;
  mat.link = jsonObject.link;
  mat.fag = jsonObject.fag;
  mat.niveau = jsonObject.niveau;
  mat.type = jsonObject.materialetype;
  return mat;
}

function generateActiveMaterialInfo() {
  materialListInfo.uniqueActiveNiveaus = [];
  materialListInfo.uniqueActiveSubjects = [];
  // get all unique subjects
  materials.forEach((mat) => {
    mat.fag.forEach((f) => {
      if (!materialListInfo.uniqueSubjects.includes(f)) {
        materialListInfo.uniqueSubjects.push(f);
      }
    });
  });
  // get all unique niveaus
  materials.forEach((mat) => {
    mat.niveau.forEach((f) => {
      if (!materialListInfo.uniqueNiveaus.includes(f)) {
        materialListInfo.uniqueNiveaus.push(f);
      }
    });
  });
  // sort the lists
  materialListInfo.uniqueSubjects.sort();
  // needs custom sorting...
  materialListInfo.uniqueNiveaus.sort();
}

function generateMaterialInfo() {
  materialListInfo.uniqueNiveaus = [];
  materialListInfo.uniqueSubjects = [];
  // get all unique subjects
  materials.forEach((mat) => {
    mat.fag.forEach((f) => {
      if (!materialListInfo.uniqueSubjects.includes(f)) {
        materialListInfo.uniqueSubjects.push(f);
      }
    });
  });
  // get all unique niveaus
  materials.forEach((mat) => {
    mat.niveau.forEach((f) => {
      if (!materialListInfo.uniqueNiveaus.includes(f)) {
        materialListInfo.uniqueNiveaus.push(f);
      }
    });
  });
  // sort the lists
  materialListInfo.uniqueSubjects.sort();
  // needs custom sorting...
  materialListInfo.uniqueNiveaus.sort();
}

function makeMaterialList() {
  // empty the list
  listContent.innerHTML = "";
  activeMaterials.sort(compareSorting);
  // make the individual elements
  activeMaterials.forEach((mat) => {
    makeMaterialElement(mat);
  });
  updateArchiveInfo();

  /*  for (
    let i = (settings.currentPage - 1) * settings.perPage;
    i < settings.perPage * settings.currentPage;
    i++
  ) {
    // stop making more elements when reached end of the list
    if (i > activeMaterials.length - 1) {
      break;
    }   
    makeMaterialElement(activeMaterials[i]);
  }*/
}

function makeFilterLists() {
  filterSubject.innerHTML = "";
  filterNiveau.innerHTML = "";
  // make filter for every unique subject filter
  materialListInfo.uniqueSubjects.forEach((s) => {
    let materialCount = 0;
    activeMaterials.forEach((m) => {
      if (m.fag.includes(s)) {
        materialCount++;
      }
    });
    makeFilter(s, materialCount, settings.subjectFilter, filterSubject);
  });
  // make filter for every unique niveau filter
  materialListInfo.uniqueNiveaus.forEach((s) => {
    let materialCount = 0;
    activeMaterials.forEach((m) => {
      if (m.niveau.includes(s)) {
        materialCount++;
      }
    });
    makeFilter(s, materialCount, settings.niveauFilter, filterNiveau);
  });
}

function makeMaterialElement(mat) {
  // clone template
  let clone = tempMat.cloneNode(true).content;
  // put the material info into the clone
  clone.querySelector(".materiale_titel").textContent = mat.titel;
  clone.querySelector(".materiale_beskrivelse").textContent = mat.beskrivelse;
  clone.querySelector(".materiale_link").href = mat.link;
  // sort materials subjects alphabetically
  mat.fag.sort();
  // make category boxes
  mat.fag.forEach((f) => {
    let cloneSubject = tempSubject.cloneNode(true).content;
    cloneSubject.querySelector("p").textContent = f;
    clone.querySelector(".materiale_fagliste").appendChild(cloneSubject);
  });
  mat.niveau.forEach((f) => {
    let cloneSubject = tempSubject.cloneNode(true).content;
    cloneSubject.querySelector("p").textContent = f;
    clone.querySelector(".materiale_fagliste").appendChild(cloneSubject);
  });
  let cloneSubject = tempSubject.cloneNode(true).content;
  cloneSubject.querySelector("p").textContent = mat.type;
  clone.querySelector(".materiale_fagliste").appendChild(cloneSubject);
  listContent.appendChild(clone);
}

function makeFilter(f, matCount, settingFilterType, parentObj) {
  // clone template
  let clone = tempFilterBox.cloneNode(true).content;
  //
  let filterDiv = clone.querySelector("div");
  let filterCheck = clone.querySelector(".fa-check-square");
  let filterUnCheck = clone.querySelector(".fa-square");
  clone.querySelector(".filter_name").textContent = f;
  clone.querySelector(".filter_count").textContent = matCount;
  // filter active - check
  if (settingFilterType.includes(f)) {
    filterCheck.style.display = "inline-block";
    filterUnCheck.style.display = "none";
    clone.querySelector(".filter_count").textContent = "";
  }
  filterDiv.addEventListener("click", () => {
    // make sure all checkmarks are not checked
    let filterState = filterCheck.style.display;
    console.log(filterState);
    let filtercheckMarks = parentObj.querySelectorAll(
      ".filter_box .fa-check-square"
    );
    let filtercheckMarkOutlines = parentObj.querySelectorAll(
      ".filter_box .fa-square"
    );
    filtercheckMarks.forEach((obj) => {
      obj.style.display = "none";
    });
    filtercheckMarkOutlines.forEach((obj) => {
      obj.style.display = "inline-block";
    });
    // checkmark
    if (filterState != "inline-block") {
      filterCheck.style.display = "inline-block";
      filterUnCheck.style.display = "none";
    } else {
      filterCheck.style.display = "none";
      filterUnCheck.style.display = "inline-block";
    }
    updateFilter(f, settingFilterType);
    updateMaterialList();
    makeFilterLists();
  });
  if (
    settingFilterType.includes(f) ||
    (settingFilterType.length == 0 && matCount > 0)
  ) {
    parentObj.appendChild(clone);
  }
}

function updateFilterCounters() {}

function updateFilter(value, filtertype) {
  // if already active, remove it
  if (filtertype.includes(value)) {
    // empty the filter
    filtertype.length = 0;
  } else {
    // empty the filter
    filtertype.length = 0;
    // add new filter value
    filtertype.push(value);
  }
  console.log(filtertype);
}

/* 
function updateFilter(value, filtertype) {
  // if filter is empty, add titel filter
  if (filtertype.length == 0) {
    filtertype.push(value);
  }
  // if value is already in filter, remove it
  else if (filtertype.includes(value)) {
    let i = filtertype.indexOf(value);
    filtertype.splice(i, 1);
  }
  //if value is not in filter then add it
  else {
    filtertype.push(value);
  }
}  */

function updateMaterialList() {
  // refill list with all materials
  activeMaterials = materials;
  // filter out material from the active list
  activeMaterials = activeMaterials.filter(subjectFilter);
  activeMaterials = activeMaterials.filter(niveauFilter);
  activeMaterials = activeMaterials.filter(searchFilter);
  settings.currentPage = 1;
  makeMaterialList();
}

function searchFilter(mat) {
  let searchCriteria = mat.titel.toLowerCase() + mat.beskrivelse.toLowerCase();
  if (searchCriteria.includes(searchInput)) {
    return true;
  } else return false;
}

function subjectFilter(mat) {
  let matches = 0;
  // how many filters it ntitel toLowerCase match with
  let matchesNeeded = settings.subjectFilter.length;
  settings.subjectFilter.forEach((subject) => {
    if (mat.fag.includes(subject)) {
      matches++;
    }
  });
  // if all values of the filter has matched with a value from student, return true
  return matches == matchesNeeded ? true : false;
}

function niveauFilter(mat) {
  let matches = 0;
  // how many filters it ntitel toLowerCase match with
  let matchesNeeded = settings.niveauFilter.length;
  settings.niveauFilter.forEach((n) => {
    if (mat.niveau.includes(n)) {
      matches++;
    }
  });
  // if all values of the filter has matched with a value from student, return true
  return matches == matchesNeeded ? true : false;
}

function updateArchiveInfo() {
  let activematerialAmount = activeMaterials.length;
  if (activematerialAmount != 1) {
    document.querySelector("#arkiv_materialeantal").textContent =
      "Viser " + activematerialAmount + " materialer";
  } else {
    document.querySelector("#arkiv_materialeantal").textContent =
      "Viser " + activematerialAmount + " materiale";
  }

  /* 
  let shownMaterialAmount = document.querySelectorAll(".materiale").length;
  let highNumber =
    (settings.currentPage - 1) * settings.perPage + shownMaterialAmount;
  let lowNumber = highNumber - shownMaterialAmount + 1;
  document.querySelector("#arkiv_materialeantal").textContent =
    "Viser " +
    lowNumber +
    "-" +
    highNumber +
    " af " +
    activematerialAmount +
    " materialer"; */
}

function updatePageButtons() {
  let lastPage = Math.ceil(activeMaterials.length / settings.perPage);
  if (settings.currentPage > 1) {
    buttonPrev.style.display = "flex";
  } else {
    buttonPrev.style.display = "none";
  }
  if (settings.currentPage < lastPage) {
    buttonNext.style.display = "flex";
  } else {
    buttonNext.style.display = "none";
  }
}

function compareSorting(a, b) {
  const A = a.titel.toLowerCase();
  const B = b.titel.toLowerCase();
  let comparison = 0;
  if (A > B) {
    comparison = 1;
  } else if (A < B) {
    comparison = -1;
  }
  return comparison;
}
