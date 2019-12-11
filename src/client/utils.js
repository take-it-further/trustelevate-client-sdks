function baloon(pid, children, extra) {
  const colors = ['91D9FD', '53E185', 'FD91EC', 'F9E271', 'FD9791'];
  const letter = pid && children && children[pid]? firstName(children[pid].data.pii)[0].toUpperCase() : "?";
  const color = letter === "?" ? '9AA3AD' : colors[pid % colors.length];
  return (<div className={"baloon " + extra } style={{backgroundColor: '#' + color}}>{letter}</div>);
}

function titleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function firstName(pii) {
  let c = pii.filter((c) => c.kind === "FIRST_NAME");
  return (c.length > 0) ? c[0].value : "";
}

function lastName(pii) {
  let c = pii.filter((c) => c.kind === "LAST_NAME");
  return (c.length > 0) ? c[0].value : "";
}

function dateOfBirth(pii) {
  let c = pii.filter((c) => c.kind === "DOB");
  return (c.length > 0) ? c[0].value : "";
}

function since(ts) {
  const d = new Date(ts);
  const n = new Date(Date.now());
  if (d.toLocaleDateString() === n.toLocaleDateString()) {
    return 'Today at ' + d.toLocaleTimeString()
  } else {
    return d.toLocaleString()
  }
  //TODO if less than a minute '... seconds ago'
  //TODO if less than hour ago '... minutes ago'
  //TODO if today then 'Today at ...'
  //TODO if yesterday 'Yesterday at ...'
  //TODO otherwise date '11th Jan 2018 hh:mm'
}

export {baloon, titleCase, firstName, lastName, dateOfBirth, since};