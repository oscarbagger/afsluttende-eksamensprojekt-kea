window.addEventListener("DOMContentLoaded", start);

let endPoint =
  "https://oscarbagger.com/kea/afsluttende_eksamensprojekt/wordpress/wp-json/wp/v2/materiale";
const listContent = document.querySelector("#arkiv_liste");
let materialData = [];
let materials = [];
let activeMaterials = [];

// html elements
const tempMat = document.querySelector(".temp_materiale");
const tempSubject = document.querySelector(".temp_materiale_fag");
const tempFilterBox = document.querySelector(".temp_filter_box");
const filterSubjectObj = document.querySelector("#filter_fag");
const filterNiveauObj = document.querySelector("#filter_niveau");
const filterTypeObj = document.querySelector("#filter_type");
const filtertypes = document.querySelectorAll(".filter_kategori");
const searchBar = document.querySelector("#searchBar input");
const filterResetButton = document.querySelector("#reset_filter_button");
let filterButtons = [];

// text in the searchbar
let searchInput = "";

const settings = {
  subjectFilter: [],
  niveauFilter: [],
  typeFilter: [],
  filterList: [],
  sortBy: null,
  sortDir: "asc",
};

const materialListInfo = {
  uniqueSubjects: [],
  uniqueNiveaus: [],
  uniqueTypes: [],
};

const materialeObj = {
  titel: "",
  beskrivelse: "",
  link: "",
  forfatter: "",
  udgiver: "",
  udgivelsestid: "",
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
  activeMaterials = materials;
  generateMaterialInfo();
  makeFilterLists();
  makeMaterialList();
  addButtonInputs();
}

function addButtonInputs() {
  searchBar.addEventListener("input", () => {
    searchInput = searchBar.value.toLowerCase();
    updateMaterialList();
  });
  filterResetButton.addEventListener("click", () => {
    // empty filters
    settings.filterList = [];
    filterButtons.forEach((b) => {
      // reset checkmarks on all filter buttons
      let filterCheck = b.querySelector(".fa-check-square");
      let filterUnCheck = b.querySelector(".fa-square");
      filterCheck.style.display = "none";
      filterUnCheck.style.display = "inline-block";
    });
    updateMaterialList();
  });
}

function makeObject(jsonObject) {
  let mat = Object.create(materialeObj);
  mat.titel = jsonObject.title.rendered;
  mat.beskrivelse = jsonObject.beskrivelse;
  mat.forfatter = jsonObject.forfatter;
  mat.udgiver = jsonObject.udgiver;
  mat.udgivelsestid = jsonObject.udgivelsestid;
  mat.link = jsonObject.link;
  mat.fag = jsonObject.fag;
  mat.niveau = jsonObject.niveau;
  mat.type = jsonObject.materialetype;
  return mat;
}

function generateMaterialInfo() {
  materials.forEach((mat) => {
    // get all unique subjects
    mat.fag.forEach((f) => {
      if (!materialListInfo.uniqueSubjects.includes(f)) {
        materialListInfo.uniqueSubjects.push(f);
      }
      // get all unique niveaus
      mat.niveau.forEach((f) => {
        if (!materialListInfo.uniqueNiveaus.includes(f)) {
          materialListInfo.uniqueNiveaus.push(f);
        }
      });
      // get all unique types
      if (!materialListInfo.uniqueTypes.includes(mat.type[0])) {
        materialListInfo.uniqueTypes.push(mat.type[0]);
      }
    });
  });
  // sort the lists
  materialListInfo.uniqueSubjects.sort();
  materialListInfo.uniqueTypes.sort();
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
  if (activeMaterials.length == 0) {
    let emptyText = document.createElement("p");
    emptyText.textContent = "Ingen materialer fundet";
    emptyText.classList.add("arkiv_emptyText");
    listContent.appendChild(emptyText);
  }
}

function makeFilterLists() {
  // make filter for every unique subject filter
  materialListInfo.uniqueSubjects.forEach((s) => {
    let materialCount = 0;
    activeMaterials.forEach((m) => {
      if (m.fag.includes(s)) {
        materialCount++;
      }
    });
    makeFilter(s, materialCount, filterSubjectObj);
  });
  // make filter for every unique niveau filter
  materialListInfo.uniqueNiveaus.forEach((s) => {
    let materialCount = 0;
    activeMaterials.forEach((m) => {
      if (m.niveau.includes(s)) {
        materialCount++;
      }
    });
    makeFilter(s, materialCount, filterNiveauObj);
  });
  // make filter for every unique type filter
  materialListInfo.uniqueTypes.forEach((s) => {
    let materialCount = 0;
    activeMaterials.forEach((m) => {
      if (m.type == s) {
        materialCount++;
      }
    });
    makeFilter(s, materialCount, filterTypeObj);
  });
}

function makeMaterialElement(mat) {
  // clone template
  let clone = tempMat.cloneNode(true).content;
  // put the material info into the clone
  clone.querySelector(".materiale_titel").textContent = mat.titel;
  clone.querySelector(".materiale_info").textContent =
    mat.forfatter + ", " + mat.udgiver + " " + mat.udgivelsestid;
  clone.querySelector(".materiale_beskrivelse").textContent = mat.beskrivelse;
  clone.querySelector(".materiale_link").href = mat.link;
  // sort materials subjects alphabetically
  mat.fag.sort();
  // make category boxes
  mat.fag.forEach((f) => {
    makeCategoryTag(f, clone);
  });
  mat.niveau.forEach((f) => {
    makeCategoryTag(f, clone);
  });
  makeCategoryTag(mat.type, clone);
  listContent.appendChild(clone);
}

function makeCategoryTag(text, parent) {
  let cloneSubject = tempSubject.cloneNode(true).content;
  cloneSubject.querySelector("p").textContent = text;
  parent.querySelector(".materiale_fagliste").appendChild(cloneSubject);
}

function makeFilter(f, matCount, parentObj) {
  // clone template
  let clone = tempFilterBox.cloneNode(true).content;
  //
  let filterDiv = clone.querySelector("div");
  let filterCheck = clone.querySelector(".fa-check-square");
  let filterUnCheck = clone.querySelector(".fa-square");
  clone.querySelector(".filter_name").textContent = f;
  clone.querySelector(".filter_count").textContent = matCount;
  filterDiv.addEventListener("click", () => {
    // checkmark
    let filterState = filterCheck.style.display;
    if (filterState != "inline-block") {
      filterCheck.style.display = "inline-block";
      filterUnCheck.style.display = "none";
    } else {
      filterCheck.style.display = "none";
      filterUnCheck.style.display = "inline-block";
    }
    updateFilter(f);
    updateMaterialList();
  });
  parentObj.appendChild(clone);
  filterButtons.push(parentObj.lastElementChild);
}

function updateFilter(value) {
  // if filter is empty, add to filter
  if (settings.filterList.length == 0) {
    settings.filterList.push(value);
  }
  // if value is already in filter, remove it
  else if (settings.filterList.includes(value)) {
    let i = settings.filterList.indexOf(value);
    settings.filterList.splice(i, 1);
  }
  //if value is not in filter then add it
  else {
    settings.filterList.push(value);
  }
}

function updateMaterialList() {
  // refill list with all materials
  activeMaterials = materials;
  // filter out material from the active list
  activeMaterials = activeMaterials.filter(filterCheck);
  activeMaterials = activeMaterials.filter(searchFilter);
  makeMaterialList();
}

function filterCheck(mat) {
  let matches = 0;
  // how many filters to match with
  let matchesNeeded = settings.filterList.length;
  if (matchesNeeded == 0) {
    return true;
  }
  // make a combined list of all the materials filter criteria (type+niveau+subject)
  let matFilterCriteria = [];
  matFilterCriteria.push(mat.type[0]);
  mat.fag.forEach((f) => {
    matFilterCriteria.push(f);
  });
  mat.niveau.forEach((f) => {
    matFilterCriteria.push(f);
  });
  // check if all the criteria matches the filters
  settings.filterList.forEach((f) => {
    matFilterCriteria.forEach((c) => {
      if (f.includes(c)) {
        matches++;
      }
    });
  });
  // if all values of the filter has matched with a value in the material, return true
  return matches == matchesNeeded ? true : false;
}

function searchFilter(mat) {
  let searchCriteria =
    mat.titel.toLowerCase() +
    mat.beskrivelse.toLowerCase() +
    mat.forfatter.toLowerCase() +
    mat.udgiver.toLowerCase();
  if (searchCriteria.includes(searchInput)) {
    return true;
  } else return false;
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
