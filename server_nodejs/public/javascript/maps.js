

var map = L.map('map').setView([38.246639,21.734573],40);


let markers = [];

var osm=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})
osm.addTo(map);


var redIcon = L.icon({
   iconUrl: 'img/red-marker.png',
   iconSize:[40,40]
});

function createDataForm(dArr) {
   // Clear element
   document.getElementById("finder").innerHTML = "";
   document.getElementById("finder").style.marginRight = "500px";
   const node = document.createElement("div");
   node.classList.add("offer-container"); // Apply the offer container style
 
   const titleNode = document.createElement("div");
   titleNode.classList.add("offer-title"); // Apply the offer title style
   const titleText = document.createTextNode(dArr[0] + " Offers");
   titleNode.appendChild(titleText);
 
   node.appendChild(titleNode);
 
   const ulTag = document.createElement("ul");
 
   endpoint = "/database/search";
 
   var formData = new FormData();
   formData.append("type", "offer");
   formData.append("sName", dArr[0]);
   formData.append("lat", dArr[1]);
   formData.append("lon", dArr[2]);
   
   fetch(endpoint, { method: "POST", body: formData })
     .then((r) => r.json())
     .then((res) => {
       var jsonData = res.message[0];
       console.log(jsonData);
       var button = document.createElement("input");
       button.setAttribute("type","button")
       button.setAttribute("id","button");
       button.setAttribute("value","Create new offer");
       
     
       for (var i = 0; i < jsonData.length; i++) {
         var liTag = document.createElement("li");
         var linkTag = document.createElement("a");
         var price=jsonData.price;
        
           

         var itemName = encodeURIComponent(jsonData[i].item_name);
         var price = encodeURIComponent(jsonData[i].price);
         var offer_id = encodeURIComponent(jsonData[i].offer_id);
         //console.log(jsonData[i].offer_id);
         linkTag.href = `/product/detail?itemName=${itemName}&price=${price}&offer_id=${offer_id}`;
         linkTag.target = "_blank";
        
         linkTag.appendChild(
           document.createTextNode(
            
             "Product: " + jsonData[i].item_name + " Price: " +price
           )
         );

         liTag.appendChild(linkTag);
         ulTag.appendChild(liTag);
       }
 
       const detailsNode = document.createElement("div");
       detailsNode.classList.add("offer-details"); // Apply the offer details style
       detailsNode.appendChild(ulTag);
       
 
       node.appendChild(detailsNode);
       node.appendChild(button);
       document.getElementById("finder").appendChild(node);
       button.addEventListener("click", () =>{
         const queryString = window.location.search;
         const urlParams = new URLSearchParams(queryString);
         const user_id = urlParams.get('user_id');
         location.href="/offer/create";
     } );


     })
 
     .catch((error) => {
       console.error("Error:", error);
     });
 }





function clickStore(storeName){
   createDataForm(storeName);
}


   //Fetch data from backend
function getData(type){
   var formData = new FormData();
   const endpoint = "/database/get";
   formData.append("type", type);

   fetch(endpoint, {method: "POST", body: formData})
   .then((r)=>r.json()).then((res) => {
      var jsonData = res.message;
      for (let i = 0; i < jsonData.length; i++){
         const dArr = [jsonData[i].store_name, jsonData[i].store_lat,jsonData[i].store_lon];
         var marker = L.marker([jsonData[i].store_lat,jsonData[i].store_lon],{icon:redIcon}).bindPopup('Supermarket'+' '+jsonData[i].store_name).on('click', function(evt){clickStore(dArr);}).addTo(map);
         markers.push(marker);
      }
   })
   .catch(err => console.error(err))
}

function clearAllMarkers(){
   for(var i = 0; i < markers.length; i++){
      markers[i].remove();
   }
   markers = [];
}

getData("super");

let formCreated = false;
const marketButton= document.getElementById("supermarkets");
marketButton.addEventListener("click",()=> {
   if(!formCreated)
   find("Search Supermarkets")
   //formCreated=true;
});

const productButton=document.getElementById("products");
productButton.addEventListener("click",()=>{
   if(!formCreated){
      find("Search Products")
      //formCreated=true;
   }
});

function find(message){
   //Clear element
   document.getElementById("finder").innerHTML="";

   const node=document.createElement("p");
   node.setAttribute("id","superText");
        
   const textNode=document.createTextNode(` ${message}`);

   node.appendChild(textNode);

   document.getElementById("finder").appendChild(node);

   const form=document.createElement("form");
   const input=document.createElement("input");
   input.setAttribute("type","search");
   input.setAttribute("id","superInput");
   const button=document.createElement("input");
   button.setAttribute("type","submit");
   button.setAttribute("id","superButton");
   button.setAttribute("value","search");

      

      
   form.appendChild(input);
   form.appendChild(button);
      
   document.getElementById("finder").appendChild(form);

   //Trigger event on user type change
   document.getElementById("superInput").oninput = async function(){
      // Get the user's input value
      const userInput = input.value;
 
      // Now you can use userInput for further processing or submit it to the server
      // Example: Send userInput to the server using fetch or AJAX
      endpoint = "/database/search";

      var formData = new FormData();
      if(message == "Search Supermarkets"){
         //Send super to get supermarkets
         formData.append("type", "super");
      }else if(message == "Search Products"){
         formData.append("type", "prod");
      }

      formData.append("term", userInput);
      const controller = new AbortController();
      const id = setTimeout(()=> controller.abort(), 2000);
      await fetch(endpoint, {method: "POST", body: formData, timeout: 2000, signal:controller.signal})
         .then((r)=>r.json()).then((res) => {
            var jsonData = res.message[0];
            //Repeat above loop amd copy the code to the button event (below)
            console.log(jsonData[0]);
            clearAllMarkers();
            for(var i = 0; i<jsonData.length; i++){
               const dArr = [jsonData[i].store_name, jsonData[i].store_lat, jsonData[i].store_lon];
               var marker = L.marker([jsonData[i].store_lat,jsonData[i].store_lon],{icon:redIcon}).bindPopup('Supermarket'+' '+jsonData[i].store_name + " Product: " + jsonData[i].item_name).on('click', function(evt){clickStore(dArr);}).addTo(map);
               markers.push(marker);
            }
         })
     
         .catch((error) => {
            console.error("Error:", error);
         });
         clearTimeout(id);
   }

   form.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission
 
      // Get the user's input value
      const userInput = input.value;
 
      // Now you can use userInput for further processing or submit it to the server
      // Example: Send userInput to the server using fetch or AJAX
      endpoint = "/database/search";

      var formData = new FormData();
      if(message == "Search Supermarkets"){
         //Send super to get supermarkets
         formData.append("type", "super");
      }else if(message == "Search Products"){
         formData.append("type", "prod");
      }

      formData.append("term", userInput);

      fetch(endpoint, {method: "POST", body: formData})
      .then((r)=>r.json()).then((res) => {
         var jsonData = res.message[0];
         var jsonData = res.message[0];
         console.log(jsonData[0]);
         clearAllMarkers();
         for(var i = 0; i<jsonData.length; i++){
            const dArr = [jsonData[i].store_name, jsonData[i].store_lat,jsonData[i].store_lon];
            var marker = L.marker([jsonData[i].store_lat,jsonData[i].store_lon],{icon:redIcon}).bindPopup('Supermarket'+' '+jsonData[i].store_name + " Product: " + jsonData[i].item_name).on('click', function(evt){clickStore(dArr);}).addTo(map);
            markers.push(marker);
         }
      })
  
      .catch((error) => {
         console.error("Error:", error);
      });
   }); 
}
         
        

         