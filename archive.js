window.addEventListener("DOMContentLoaded",start);

let endPoint="https://oscarbagger.com/kea/afsluttende_eksamensprojekt/wordpress/wp-json/wp/v2/materiale";
const listContent=document.querySelector("#arkiv_liste");
let materialData=[];
let materials=[];
let activeMaterials=[];

let uniqueSubjects=[];

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
    generateMaterialInfo();
  }

function makeObject(jsonObject) {
    let mat = Object.create(materialeObj);
    mat.titel=jsonObject.title.rendered;
    mat.beskrivelse=jsonObject.beskrivelse;
    mat.link=jsonObject.link;
    mat.fag=jsonObject.fag;
    mat.niveau=jsonObject.niveau;
    return mat;
}

function generateMaterialInfo()
{
    // get all unique subjects
    activeMaterials.forEach(mat=> {
        mat.fag.forEach(f => {
            if(!uniqueSubjects.includes(f))
            {uniqueSubjects.push(f);}
        });
    });
    console.log(uniqueSubjects);
}

function makeMaterialList()
{
    // empty the list
    listContent.innerHTML="";
    activeMaterials.sort(compare);
    // make the individual elements
    activeMaterials.forEach(m => {
        makeMaterialElement(m);
    });
    updateArchiveInfo();
}

function makeMaterialElement(mat)
{
    // clone template
        let clone=tempMat.cloneNode(true).content;
        // put the material info into the clone
        clone.querySelector(".materiale_titel").textContent=mat.titel;
        clone.querySelector(".materiale_beskrivelse").textContent=mat.beskrivelse;
        clone.querySelector(".materiale_link").href=mat.link;
        // sort materials subjects alphabetically
        mat.fag.sort();
        // 
        mat.fag.forEach(f => {
            let cloneSubject=tempSubject.cloneNode(true).content;
            cloneSubject.querySelector("p").textContent=f;
            clone.querySelector(".materiale_fagliste").appendChild(cloneSubject);
        })
        mat.niveau.forEach(f => {
            let cloneSubject=tempSubject.cloneNode(true).content;
            cloneSubject.querySelector("p").textContent=f;
            clone.querySelector(".materiale_fagliste").appendChild(cloneSubject);
        })
    listContent.appendChild(clone);
}

function updateFilter(value, filtertype)
{
      // if filter is empty, add vtitel toLowerCase filter
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
    updateArchiveInfo();
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
    // how many filters it ntitel toLowerCase match with
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
    // how many filters it ntitel toLowerCase match with
    let matchesNeeded = settings.niveauFilter.length;
    settings.niveauFilter.forEach(n => {
        if(mat.niveau.includes(n))
        { matches++; } 
    });
    // if all values of the filter has matched with a value from student, return true
    return (matches == matchesNeeded ?  true: false);
}

function updateArchiveInfo()
{
    let materialAmount=activeMaterials.length;
    if(materialAmount==1)
    {    document.querySelector("#arkiv_materialeantal").textContent="Viser "+materialAmount +" materiale"; } else {
        document.querySelector("#arkiv_materialeantal").textContent="Viser "+materialAmount +" materialer";
    }
}

function compare(a, b) {
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