window.addEventListener("DOMContentLoaded",start);

let endPoint="https://oscarbagger.com/kea/afsluttende_eksamensprojekt/wordpress/wp-json/wp/v2/materiale";
const listContent=document.querySelector("main");
let materialeData=[];
let materialer=[];


// templates
const tempMat=document.querySelector(".temp_materiale");
const tempSubject=document.querySelector(".temp_materiale_fag");

const settings = {
    filter: [],
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
}

async function fetchJson() 
{   
    const jsonData = await fetch(endPoint);
    materialeData=await jsonData.json();
    prepareObjects(materialeData);
}

function prepareObjects(jsonData) {
    materialer = jsonData.map(makeObject);
    console.log(materialer);
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
    materialer.forEach(m => {
        makeMaterialElement(m);
    })
}

function makeMaterialElement(mat)
{
        let clone=tempMat.cloneNode(true).content;
        clone.querySelector(".materiale_titel").textContent=mat.titel;
        clone.querySelector(".materiale_beskrivelse").textContent=mat.beskrivelse;
        clone.querySelector(".materiale_link").textContent=mat.link;
        // sort alphabetically
        mat.fag.sort();
        // 
        mat.fag.forEach(f => {
            let cloneSubject=tempSubject.cloneNode(true).content;
            cloneSubject.querySelector("p").textContent=f;
            clone.querySelector(".materiale_fagliste").appendChild(cloneSubject);
        })
    listContent.appendChild(clone);
}