window.addEventListener("DOMContentLoaded",start);

let endPoint="https://oscarbagger.com/kea/afsluttende_eksamensprojekt/wordpress/wp-json/wp/v2/materiale";
const listContent=document.querySelector("main");
let materialData=[];
let materials=[];
let activeMaterials=[];

// text in the searchbar
let searchInput = "";

// templates
const tempMat=document.querySelector(".temp_materiale");
const tempSubject=document.querySelector(".temp_materiale_fag");
const filterSubjectButtons=document.querySelectorAll(".kategori_fag div input");
const filterNiveauButtons=document.querySelectorAll(".kategori_niveau div input");
const searchBar=document.querySelector("#searchBar input");

const settings = {
    subjectFilter: [],
    niveauFilter: [],
    sortBy: null,
    sortDir: "asc",
  };

const materialeObj= {
    titel: "",
    beskrivelse:"",
    link:"",
    fag: [],
    niveau: [],
};

function start()
{
    fetchJson();

    filterSubjectButtons.forEach((button) => {
        button.addEventListener("click", function () {
          updateFilter(this.value, settings.subjectFilter);
          updateMaterialList();
        });
      });
    filterNiveauButtons.forEach((button) => {
        button.addEventListener("click", function () {
          updateFilter(this.value, settings.niveauFilter);
          updateMaterialList();
        });
      });
    searchBar.addEventListener("input", function () {
        searchInput = searchBar.value.toLowerCase();
        updateMaterialList();
      });
}

async function fetchJson() 
{   
    const jsonData = await fetch(endPoint);
    materialData=await jsonData.json();
    prepareObjects(materialData);
}

function prepareObjects(jsonData) {
    materials = jsonData.map(makeObject);
    console.log(materials);
    activeMaterials=materials;
    makeMaterialList();
  }

function makeObject(jsonObject) {
    let mat = Object.create(materialeObj);
    mat.titel=jsonObject.title.rendered;
    mat.beskrivelse=jsonObject.beskrivelse;
    mat.fag=jsonObject.fag;
    mat.niveau=jsonObject.niveau;
    return mat;
}

function makeMaterialList()
{
    // empty the list
    listContent.innerHTML="";
    // make the individual elements
    activeMaterials.forEach(m => {
        makeMaterialElement(m);
    });
}

function makeMaterialElement(mat)
{
    // clone template
        let clone=tempMat.cloneNode(true).content;
        // put the material info into the clone
        clone.querySelector(".materiale_titel").textContent=mat.titel;
        clone.querySelector(".materiale_beskrivelse").textContent=mat.beskrivelse;
        clone.querySelector(".materiale_link").textContent=mat.link;
        // sort materials subjects alphabetically
        mat.fag.sort();
        // 
        mat.fag.forEach(f => {
            let cloneSubject=tempSubject.cloneNode(true).content;
            cloneSubject.querySelector("p").textContent=f;
            clone.querySelector(".materiale_fagliste").appendChild(cloneSubject);
        })
    listContent.appendChild(clone);
}

function updateFilter(value, filtertype)
{
      // if filter is empty, add value to filter
    if (filtertype.length == 0) {
        filtertype.push(value);
    }
    // if value is already in filter, remove it
    else if (filtertype.includes(value))
    {
        let i = filtertype.indexOf(value);
        filtertype.splice(i, 1);
    }
    //if value is not in filter then add it
    else {
    filtertype.push(value);
    }
}

function updateMaterialList()
{
    // refill list with all materials
    activeMaterials=materials;
    // filter out material from the active list
    activeMaterials=activeMaterials.filter(subjectFilter);
    activeMaterials=activeMaterials.filter(niveauFilter);
    activeMaterials=activeMaterials.filter(searchFilter);
    makeMaterialList();
}

function searchFilter(mat)
{
    let searchCriteria = mat.titel.toLowerCase()+mat.beskrivelse.toLowerCase();
    if (searchCriteria.includes(searchInput)) {
      return true;
    } else return false;
}

function subjectFilter(mat)
{
    let matches = 0;
    // how many filters it needs to match with
    let matchesNeeded = settings.subjectFilter.length;
    settings.subjectFilter.forEach(subject => {
        if(mat.fag.includes(subject))
        { matches++; } 
    });
    // if all values of the filter has matched with a value from student, return true
    return (matches == matchesNeeded ?  true: false);
}

function niveauFilter(mat)
{
    let matches = 0;
    // how many filters it needs to match with
    let matchesNeeded = settings.niveauFilter.length;
    settings.niveauFilter.forEach(n => {
        if(mat.niveau.includes(n))
        { matches++; } 
    });
    // if all values of the filter has matched with a value from student, return true
    return (matches == matchesNeeded ?  true: false);
}