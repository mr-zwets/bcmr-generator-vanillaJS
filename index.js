// see switchery docs
let elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
elems.forEach(elem => {
  const switchery = new Switchery(elem, { size: 'small', color:"#0ac18f"});
});
// Has NFTs switch
let hasNFTs = false;
const hasNFTsSwitch = document.querySelector('#hasNFTsSwitch');
document.querySelector('#hasNFTsSwitch').checked = false;
hasNFTsSwitch.onchange = () => showNFTfields();
function showNFTfields() {
  hasNFTs = !hasNFTs;
  document.querySelector('#NFTfields').style.display = hasNFTs? "block": "none";
}

// Has NFTs switch
let hasNFTimages = false;
const hasImagesSwitch = document.querySelector('#hasImagesSwitch');
document.querySelector('#hasImagesSwitch').checked = false;
hasImagesSwitch.onchange = () => hasNFTimages = !hasNFTimages;

const listUris = [ [] ];
createList(listUris);

window.addUri = () => {
  listUris.push([]);
  createList(listUris);
}

window.removeUri = () => {
  listUris.splice(-1);
  createList(listUris);
}

function createList(listUris) {
  const Placeholder = document.getElementById("Placeholder");
  const ul = document.createElement("ul");
  ul.setAttribute("id", "Placeholder");
  const template = document.getElementById("uri-template");
  listUris.forEach((uri,index) => {
    const uriItem = document.importNode(template.content, true);
    const uriSelect = uriItem.getElementById("uriSelect");
    const uriInput = uriItem.getElementById("uriInput");
    const uriIdentifier = (i, event) => {
      if(event.target.value) listUris[i][0] = event.target.value;
      createList(listUris);
    }
    const uriValue = (i, event) => {
      if(event.target.value) listUris[i][1] = event.target.value;
      createList(listUris);
    }
    uriSelect.onchange = (event) => uriIdentifier(index, event);
    uriInput.onchange = (event) => uriValue(index, event);
    if(uri[0]) uriSelect.value = uri[0];
    if(uri[1]) uriInput.value = uri[1];
    ul.appendChild(uriItem);
  });
  console.log(listUris)
  Placeholder.replaceWith(ul);
}

window.createBcmrFile = () => {
  const bcmrJsonObj = createJsonObj();
  if(bcmrJsonObj) download('bcmr.json', JSON.stringify(bcmrJsonObj,null, 2));
}

function createJsonObj() {
  const tokenId = document.getElementById("tokenId").value;
  const iconUri = document.getElementById("iconUri").value;
  const tokenName = document.getElementById("tokenName").value;
  const tokenDescription = document.getElementById("tokenDescription").value;
  const tokenSymbol = document.getElementById("tokenSymbol").value;
  const numberNFTs = document.getElementById("numberNFTs").value;
  const nftName = document.getElementById("nftName").value;
  const nftDescription = document.getElementById("nftDescription").value;
  const nftIconUri = document.getElementById("nftIconUri").value;
  const nftIconType = document.getElementById("nftIconType").value;
  const webUrl = document.getElementById("webUrl").value;
  const tokenDecimals = document.getElementById("tokenDecimals").value;

  const newDate = new Date();
  const isoString = newDate.toISOString();

  const registryIdentityName = `bcmr for ${tokenName}`;
  const registryIdentityDescription = `self-published bcmr for ${tokenName}`;

  let hasRequiredFields = tokenId && tokenName && tokenDescription && tokenSymbol;
  if(hasNFTs) hasRequiredFields = hasRequiredFields && numberNFTs && nftName;

  if(!hasRequiredFields){
    alert("Fill in all the required fields before generating the JSON file!")
    return
  }

  // Generate BCMR json obj
  const bcmrJsonObj = {
    "$schema": "https://cashtokens.org/bcmr-v2.schema.json",
    "version": { "major": 0, "minor": 1, "patch": 0 },
    "latestRevision": isoString,
    "registryIdentity": {
      "name": registryIdentityName,
      "description": registryIdentityDescription,
    },
    "identities": {
      [tokenId]: {
        [isoString]: {
          "name": tokenName,
          "description": tokenDescription,
          "token": {
            "category": tokenId,
            "symbol": tokenSymbol
          },
          "uris": {
            "icon": iconUri,
            "web": webUrl
          }
        }
      }
    }
  }
  const snapshot = bcmrJsonObj.identities[tokenId][isoString];
  if(tokenDecimals) snapshot.token.decimals = parseInt(tokenDecimals);
  if(hasNFTs){
    snapshot.token.nfts = {
      description: "",
      parse: {
        types: {}
      }
    };
    const NFTtypes = snapshot.token.nfts.parse.types;
    for(let i=1; i<=numberNFTs; i++){
      let nftNameNumbered = nftName.replace("{i}", i);
      let nftDescriptionNumbered = nftDescription.replace("{i}", i);
      NFTtypes[i] = {
        "name": nftNameNumbered,
        "description": nftDescriptionNumbered ,
        "uris": {
          "icon": nftIconUri + `/${i}.${nftIconType}`
        }
      }
      if(hasNFTimages) NFTtypes[i].uris.image = nftIconUri + `/${i}-img.${nftIconType}`
    }
  }
  if(webUrl) snapshot.uris.web = webUrl;
  listUris.forEach(uri => {
    if(uri[0] && uri[1]) snapshot.uris[uri[0]] = uri[1];
  })
  return bcmrJsonObj;
}

function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
