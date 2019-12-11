import React from 'react';

class PinForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      oldPassword: "",
      password: "",
      passwordRepeat: "",
      userError: "",
      pin: "",
      showResendOption: true,
      info: "",
      enabled: true
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOnResend = this.handleOnResend.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    if ((this.props.action === "CREATE_PASSWORD" || this.props.action === "RESET_PASSWORD")
        && this.state.password !== this.state.passwordRepeat) {
      this.setState({userError: "repeated password is not the same as password"})
    } else {
      this.setState({userError: undefined, enabled: false});
      const main = this;
      this.props.onSubmit(
          this.props.action === "RESET_PASSWORD" ? this.state.oldPassword : undefined,
          this.state.password,
          this.state.pin, function (ok, status) {
            if (!ok) {
              main.setState({enabled: true})
              switch (status) {
                case 423:
                  main.setState({userError: "Your account has been temporarily locked."})
                  break;
                case 403:
                  main.setState({userError: "Invalid password or SMS code"})
                  break;
                default:
                  main.setState({userError: "Authentication failed"})
                  break;
              }
            }
          }
      )
    }
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleOnResend(event) {
    event.preventDefault();
    const main = this;
    main.setState({showResendOption: undefined})
    this.props.onRequestResendSms(function (info, state) {
      main.setState({
        info: info,
        pin: "",
        showResendOption: state
      })
    })

  }

  render() {
    if (!this.state.enabled) {
      return <p>Authenticating..</p>
    } else if (this.props.action === "CREATE_PASSWORD") {
      return (

          <div className="content">
            <h1 className="title is-4 has-text-weight-bold">Complete your account</h1>
            <p className="subtitle is-5 has-text-grey">
              {this.state.showResendOption === false &&
              <span>{this.state.info} <a href="#" onClick={this.handleOnResend}>Resend</a></span>}
              {this.state.showResendOption === true && <span>Create password for your account.</span>}
              {this.state.showResendOption === undefined && <span>Requesting SMS code...</span>}
            </p>
            <form onSubmit={this.handleSubmit}>
              <div className="alert-warning">{this.state.userError}</div>

              <fieldset>
                <div className="field">
                  <div className="control input-wrapper">
                    <input placeholder={"New Password"} className="input" type="password" name="password"
                           value={this.state.password} onChange={this.handleChange}/>
                  </div>
                </div>
                <div className="field">
                  <div className="control input-wrapper">
                    <input placeholder={"New Password (Repeat)"} className="input" type="password"
                           name="passwordRepeat" value={this.state.passwordRepeat}
                           onChange={this.handleChange}/>
                  </div>
                </div>
              </fieldset>
              <div>
                {this.state.showResendOption === true &&
                <button onClick={this.handleOnResend} className="button is-primary is-large is-rounded is-fullwidth">Send SMS Pin</button>}
                {this.state.showResendOption !== true && (<div>
                      <div className="field">
                        <div className="control input-wrapper">
                          <input placeholder="SMS Code" type="text" name="pin" value={this.state.pin}
                                 onChange={this.handleChange} autoComplete="one-time-code" className="input"/>
                        </div>
                      </div>
                      <button type="submit" onClick={this.handleSubmit}
                              className="button is-primary is-large is-rounded is-fullwidth"> Authenticate
                      </button>
                    </div>
                )}
              </div>
            </form>
            <div className="columns">
              <div className="column">
                <br/>
                <center><a onClick={this.props.onSignOut}>Cancel</a></center>
              </div>
            </div>
          </div>)
    } else if (this.props.action === "RESET_PASSWORD") {
      return (<div>
        <form onSubmit={this.handleSubmit}>
          <h5>Reset your password</h5>
          {this.state.showResendOption === false &&
          <p>{this.state.info} <a href="#" onClick={this.handleOnResend}>Resend</a></p>}
          {this.state.showResendOption === true && <p>You need to reset your password now.</p>}
          {this.state.showResendOption === undefined && <p>Requesting SMS code...</p>}
          <div className="alert-warning">{this.state.userError}</div>
          <div className="form-group">
            <input placeholder={"Old Password"} className="form-control" type="password" name="oldPassword"
                   onChange={this.handleChange}/>
            <input placeholder={"New Password"} className="form-control" type="password" name="password"
                   onChange={this.handleChange}/>
            <input placeholder={"New Password (Repeat)"} className="form-control" type="password"
                   name="passwordRepeat" onChange={this.handleChange}/>
          </div>
          <div className="form-group">
            {this.state.showResendOption === true &&
            <button onClick={this.handleOnResend} style={{width: '100%'}}>Send SMS Pin</button>}
            {this.state.showResendOption !== true && (<div>
                  <input placeholder="SMS Code" type="text" name="pin" value={this.state.pin}
                         onChange={this.handleChange} autoComplete="one-time-code"/>
                  <button type="submit" onClick={this.handleSubmit} style={{width: '100%'}}>Authenticate
                  </button>
                </div>
            )}
          </div>
          <center><a href="#" onClick={this.props.onSignOut}>Cancel</a></center>
        </form>
      </div>)
    } else if (this.props.action === "NONE") {
      return (
          <div className="content">
            <h1 className="title is-4 has-text-weight-bold">Authenticate</h1>
            <p className="subtitle is-5 has-text-grey">
              {this.state.showResendOption === false &&
              <span>{this.state.info} <a href="#" onClick={this.handleOnResend}>Resend</a></span>}
              {this.state.showResendOption === true && <span>Enter password for an existing account</span>}
              {this.state.showResendOption === undefined && <span>Requesting SMS code...</span>}
            </p>

            <form onSubmit={this.handleSubmit}>
              <div className="alert-warning">{this.state.userError}</div>

              <fieldset>
                <div className="field">
                  <div className="control input-wrapper">
                    <input className="input" type="password" name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange}/>
                  </div>
                </div>
              </fieldset>

              {this.state.showResendOption &&
              <button onClick={this.handleOnResend} style={{width: '100%'}} className="button is-primary is-large is-rounded is-fullwidth">Send SMS Pin</button>}

              {this.state.showResendOption !== true && (<div>
                <fieldset>
                  <div className="field">
                    <div className="control input-wrapper">
                      <input className="input" placeholder="SMS Code" type="text" name="pin" value={this.state.pin}
                             onChange={this.handleChange} autoComplete="one-time-code"/>
                    </div>
                  </div>
                </fieldset>
                <button type="submit" onClick={this.handleSubmit} style={{width: '100%'}} className="button is-primary is-large is-rounded is-fullwidth">Authenticate</button>
              </div>)}
            </form>
            <div className="columns">
              <div className="column">
                <br/>
                <center><a href="#" onClick={this.props.onSignOut}>Cancel</a></center>
              </div>
            </div>
          </div>
      )
    } else {
      return (<p className="subtitle has-text-grey-light has-text-weight-semibold is-6">Restoring your session&hellip;</p>)
    }
  }
}

export default PinForm;