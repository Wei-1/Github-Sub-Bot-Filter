const params = new URLSearchParams(document.location.search);
const uid = (params.get("uid") === undefined || params.get("uid") == null) ?
  "Wei-1" : params.get("uid");
console.log(uid);

var data = {"followers":[],"following":[]}
var req = new XMLHttpRequest();
var latestType = "followers"
req.onload = function() {
  if (this.status >= 200 && this.status < 400) {
    // Success!
    var tmp = JSON.parse(this.response);
    console.log(tmp);
    data[latestType] = tmp;
    ReactDOM.render(
      <Report />,
      document.getElementById('content')
    );
  } else { // Try Again
    getOutput(latestType);
  }
};
function getOutput(reqtype) {
  latestType = reqtype;
  req.open('GET', 'https://api.github.com/users/' +
    uid + '/' + reqtype + '?per_page=100', true);
  req.send();
}
getOutput('followers');
setTimeout(function() {getOutput('following');}, 1000);

function getColor(check) {
  if (check) return {color:'#0f0'};
  else return {color:'#f00'};
}
function checkFollow(id) {
  var check = false
  data['followers'].forEach(user => {
    if (user.id == id) check = true;
  });
  return <h4 style={getColor(check)}> {check + ""} </h4>;
}
function Report() {
  var stats = data['following'].map(function(user, index) {
    return (
      <tr>
        <td><img src={user.avatar_url} width="20" /></td>
        <td><a href={user.html_url}><h4> {user.login} </h4></a></td>
        <td> {checkFollow(user.id)} </td>
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
