const params = new URLSearchParams(document.location.search);
const uid = (params.get("uid") === undefined || params.get("uid") == null) ?
  "Wei-1" : params.get("uid");
console.log(uid);

var data = {"followers":[],"following":[]}
var req = new XMLHttpRequest();
var latestType = "followers";
var countType = 1;
var countIndex = 1;
var retryTime = 100;
req.onload = function() {
  if (this.status >= 200 && this.status < 400) {
    // Success!
    var tmp = JSON.parse(this.response);
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
    var cnt = data['user'][latestType];
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
  if (check) return {color:'#0f0'};
  else return {color:'#f00'};
}
function checkFollow(id) {
  let check = false
  data['followers'].forEach(user => {
    if (user.id == id) check = true;
  });
  return check;
}
function renderFollow(id) {
  let check = checkFollow(id);
  return <h4 style={getColor(check)}> {check + ""} </h4>;
}
function compareFollowing(a, b) {
  return checkFollow(a.id) - checkFollow(b.id);
}
function Report() {
  var stats = data['following'].sort(compareFollowing).map(function(user, index) {
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
