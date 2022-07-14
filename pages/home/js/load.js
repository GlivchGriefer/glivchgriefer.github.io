"use strict"
/* JavaScript Document */
document.documentElement.onload = function(){ 
    document.getElementById("loader").style.display = "block"; 
}; 
//or 
document.documentElement.addEventListener("load", function(){ 
    document.getElementById("loader").style.display = "block"; 
});

window.onload = function(){ 
    document.getElementById("loader").style.display = "none"; 
}; 
//or 
window.addEventListener("load", function(){ 
    document.getElementById("loader").style.display = "none"; 
});


