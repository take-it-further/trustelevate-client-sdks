import React from 'react';

class UserForm extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleError = this.handleError.bind(this);
    props.errorHanlder(this.handleError);
    let phone = (props.phone || "").replace("00", "+");
    let country = "United Kingdom";
    this.countries = {
      "United Kingdom": "+44",
      "Germany": "+49",
      "Czechia": "+420",
      "Slovakia": "+421"
    };
    Object.keys(this.countries).forEach((c) => {
      const code = this.countries[c];
      if (phone.startsWith(code)) {
        country = c;
        phone = phone.substr(code.length)
      }
    });
    this.state = {
      name: props.name || "",
      email: props.email || undefined,
      phone: phone,
      country: country,
      enabled: true,
      errors: []
    };
  }
  handleError(msg) {
    this.setState((prev) => ({
      enabled: true,
      email: prev.email !== undefined ? prev.email : (msg.code === 40901 ? "" : undefined ),
      errors: [msg]}))
  }

  handleSubmit(event) {
    event.preventDefault();
    const errors = [];
    if (!this.state.name) errors.push("Full name is required");
    if (!this.state.phone) errors.push("Phone number is required");
    if (errors.length > 0) {
      this.setState({enabled: true, errors: errors})
    } else {
      this.setState({enabled: false});
      this.props.onSubmit({
        register: this.props.register,
        name: this.state.name,
        email: this.state.email,
        phone: this.countries[this.state.country] + this.state.phone.replace(/^0+/, '')
      })
    }
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    if (!this.state.enabled) {
      return <p>Checking account information..</p>
    } else
      return (
          <div className="content">
            <h1 className="title is-4 has-text-weight-bold">Welcome to Veripass</h1>
            <p className="subtitle is-5 has-text-grey">
              {!this.props.register && (<span>Sign in to get started.</span>)}
              {this.props.register && (<span>Create your free account now.</span>)}
            </p>

            {this.state.errors.length > 0 && (<blockquote>
              {this.state.errors.map((error, index) => (<em key={index} className="alert alert-danger">{error.message ? error.message : error}<br/></em>))}
            </blockquote>)}
            <form onSubmit={this.handleSubmit}>
              <fieldset>
                <div className="field">
                  <div className="control input-wrapper">
                    <input className="input" type="text" name="name" placeholder="Full name (required)" value={this.state.name} onChange={this.handleChange}/>
                  </div>
                </div>
                {(this.props.register || this.state.email !== undefined) && (<div className="field">
                  <div className="control input-wrapper">
                    <input className="input" type="email" name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange}/>
                  </div>
                </div>)}
                <div className="columns is-mobile">
                  <div className="column is-narrow">
                    <div className="field">
                      <div className="control">
                        <div className="select">
                          <select name="country" onChange={this.handleChange} value={this.state.country}>
                            { Object.keys(this.countries).map((country) => (<option key={country} value={country}>{this.countries[country]}</option>)) }
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="column">
                    <div className="field">
                      <div className="control input-wrapper">
                        <input className="input" type="tel" name="phone" placeholder="Phone number (required)" value={this.state.phone} onChange={this.handleChange}/>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
              <button type="submit" className="button is-primary is-large is-rounded is-fullwidth">{this.props.register ? "Sign Up Now" : "Sign in"}</button>
              <center>
                <br/>
                {!this.props.register && (
                    <span>or <a href="#signup">Sign Up </a> if you don't have an account.<br/>(this service is free of charge)</span>
                )}
                {this.props.register && (
                    <span>or <a href="#">Sign In</a> if you already have an account.</span>
                )}

              </center>
            </form>
          </div>
      );
  }
}

export default UserForm;