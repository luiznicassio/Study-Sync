

document.querySelector('#addToggle').addEventListener('click', ()=>{
  const create = document.querySelector('.create')
  const addAtivado = document.querySelector('#addativado')  
  const addToggle = document.querySelector('#addToggle')  


  create.style.display = "block";
  addAtivado.style.display = "block"
  addToggle.style.display = "none"
})


document.querySelector('#addativado').addEventListener('click', ()=>{
  const create = document.querySelector('.create')
  const addAtivado = document.querySelector('#addativado')  
  const addToggle = document.querySelector('#addToggle')  


  create.style.display = "none";
  addAtivado.style.display = "none"
  addToggle.style.display = "block"
})