import React from 'react';

class UserInfo extends React.Component {

  constructor(props) {
    super(props);
    this.handleSignOutClick = this.handleSignOutClick.bind(this);
  }

  handleSignOutClick(e) {
    e.preventDefault();
    this.props.onSignOut()
  }

  render() {
    return (
        <div>
          <span>PID: <b>{this.props.pid}</b></span>
          <br/>
          {this.props.profile && (<div>
            <span>Name: <b>{this.props.profile.name}</b></span>
            <br/>
            <span>Emails: <b>{this.props.profile.emails.join(", ")}</b></span>
            <br/>
            <span>Phones: <b>{this.props.profile.phones.join(", ")}</b></span>
            <br/>
          </div>)}
        </div>
    );
  }
}

export default UserInfo;