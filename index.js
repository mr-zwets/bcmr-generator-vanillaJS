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
    else{ uriSelect.value = ""}
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
  const webUrl = document.getElementById("webUrl").value;
  const tokenDecimals = document.getElementById("tokenDecimals").value;

  const newDate = new Date();
  const isoString = newDate.toISOString();

  const registryIdentityName = `bcmr for ${tokenName}`;
  const registryIdentityDescription = `self-published bcmr for ${tokenName}`;

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
