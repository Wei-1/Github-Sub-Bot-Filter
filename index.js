const params = new URLSearchParams(document.location.search);
const uid = (params.get("uid") === undefined || params.get("uid") == null) ?
  "Wei-1" : params.get("uid");
console.log(uid);

let renderMapping = {
  0: "Following not Follower",
  1: "Follower not Following",
  2: "Bot",
  3: "Mutual Follow",
  4: "Organization"
};
let orgs = ["OpenLive3D"];
let bots = ["vjanz", "imaarov", "Rafaelmdcarneiro", "yuuire", "libraiger", "itsparsh10", "sreya-satheesh",
            "blocage", "x3ric", "Ashishcxz", "nathalylorena", "SysAdminHeal", "shahradelahi",
            "md-sazzadul-islam", "kamil-lm", "MisterRust", "smile1130", "sleinkaraman", "rabnail",
            "MuhammadRayyan16", "vintagewang", "KiLJ4EdeN", "qpeckin", "JyaburaniTech", "bambi-bf",
            "sonjibony", "l950x", "iloveryuux", "ammadsaleem18", "OracleBrain", "WhityGhost",
            "Ikuzweshema", "skeleton1009", "xmoohad", "rairoshni2005", "Tomiwa-Ot", "razaafazal",
            "WhitePoodleMoth", "rizwansammo", "khanovico", "madeindex", "despicableGruu", "wizasol",
            "PremChapagain", "ekrishnachaitanya2004", "renominated", "rainbowdev1359",
            "YoussefMoHlemyAlpha", "Keviiiiiiiin", "kentaurse", "topsecretagent007"];
let allUserChecks = {};
let allUserObjs = {};
function dataOrganization() {
  data['followers'].forEach(user => {
    allUserObjs[user.id] = user;
    if(bots.includes(user.login)) {
      allUserChecks[user.id] = 2;
    } else {
      allUserChecks[user.id] = 1;
    }
  });
  data['following'].forEach(user => {
    allUserObjs[user.id] = user;
    if(orgs.includes(user.login)) {
      allUserChecks[user.id] = 4;
    } else if(allUserChecks.hasOwnProperty(user.id)) {
      allUserChecks[user.id] = 3;
    } else {
      allUserChecks[user.id] = 0;
    }
  });
}

let data = {"followers":[],"following":[]}
let req = new XMLHttpRequest();
let latestType = "followers";
let countType = 1;
let countIndex = 1;
let retryTime = 100;
req.onload = function() {
  if (this.status >= 200 && this.status < 400) {
    // Success!
    let tmp = JSON.parse(this.response);
    console.log(tmp);
    if(latestType == "user") {
      data[latestType] = tmp;
    } else {
      data[latestType] = data[latestType].concat(tmp);
    }
    if(latestType == "user") {
      setTimeout(function() {apiCall("followers");}, 100);
    } else if(countIndex < countType) {
      countIndex += 1;
      apiCall(latestType);
    } else if(latestType == "followers") {
      countIndex = 1;
      setTimeout(function() {apiCall("following");}, 100);
    } else if(latestType == "following" && countIndex == countType) {
      dataOrganization();
      ReactDOM.render(
        <Report />, document.getElementById('content')
      );
    }
  } else { // Try Again
    setTimeout(function() {
      retryTime *= 4;
      apiCall(latestType);
    }, retryTime);
  }
};
function apiCall(reqtype) {
  latestType = reqtype;
  if(latestType == "user") {
    req.open('GET', 'https://api.github.com/users/' + uid, true);
  } else {
    let cnt = data['user'][latestType];
    countType = parseInt(Math.ceil(cnt / 100.0), 10);
    console.log(latestType + " " + countType + " " + countIndex);
    req.open('GET', 'https://api.github.com/users/' +
      uid + '/' + latestType + '?page=' + countIndex +
      '&per_page=100', true);
  }
  req.send();
}
apiCall("user");

function getColor(check) {
  switch (check) {
    case 0:
      return {color:'#f00'};
    case 1:
      return {color:'#00f'};
    case 2:
      return {color:'#888'};
    case 3:
      return {color:'#0f0'};
    case 4:
      return {color:'#ff0'};
    default:
      return {color:'#000'};
  }
}
function renderFollow(id) {
  let check = allUserChecks[id]
  return <h4 style={getColor(check)}> {renderMapping[check]} </h4>;
}
function compareFollowing(a, b) {
  return allUserChecks[a] - allUserChecks[b];
}
function Report() {
  let stats = Object.keys(allUserObjs).sort(compareFollowing).map(function(id, index) {
    let user = allUserObjs[id];
    return (
      <tr>
        <td><img src={user.avatar_url} width="20" /></td>
        <td><a href={user.html_url}><h4> {user.login} </h4></a></td>
        <td> {renderFollow(user.id)} </td>
      </tr>
    );
  }, this);
  return (
    <table>
      <tr><th/><th>User</th><th>Following Me or Not</th></tr>
      {stats}
    </table>
  );
};
