import React from 'react';
import api from './service/api.service';
import PinForm from "./pin.form";
import UserForm from "./user.form";
import ConsentList from "./consent.list";
import UserInfo from "./user.info";

class Main extends React.Component {

  // updateSession(_ssid) {
  //   this.ssid = _ssid;
  //   this.setState({ssid: this.ssid});
  //   sessionStorage.setItem('ssid', this.ssid);
  // }

  constructor(props) {
    super(props);

    this.createWebSocket = this.createWebSocket.bind(this);
    this.errorHandler = this.errorHandler.bind(this)
    this.handleOnReset = this.handleOnReset.bind(this);
    this.handleOnSignOut = this.handleOnSignOut.bind(this);
    this.sendRegistrationData = this.sendRegistrationData.bind(this);
    this.handlePinFromSubmit = this.handlePinFromSubmit.bind(this);
    this.requestResendSms = this.requestResendSms.bind(this);
    this.parseHash = this.parseHash.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this)

    if (window.location.host == "staging-my.veripass.uk") {
      this.htbase = "https://staging-api.veripass.uk";
      this.wsbase = "wss://staging-api.veripass.uk";
    }
    if (window.location.host.startsWith("localhost")) {
      // this.htbase = "http://local-api.veripass.uk:8881"
      // this.wsbase = "ws://local-api.veripass.uk:8881"
      this.htbase = "https://staging-api.veripass.uk";
      this.wsbase = "wss://staging-api.veripass.uk";
    }

    const storedProfile = sessionStorage.getItem("profile");
    const profile = (storedProfile ? JSON.parse(storedProfile) : {pii: {}});

    this.onError = function(msg) {
      console.log(msg)
    };

    this.state = {
      connect: false,
      auth: false,
      pid: profile.pid,
      action: undefined,
      token: profile.token,
      pii: profile.pii,
      revision: undefined,
      services: {},
      consents: {},
      children: {},
      menuIsActive: false,
      page: "",
    };

  }

  errorHandler(func) {
    this.onError = func
  }

  componentDidMount() {
    this.createWebSocket();
    this.parseHash();
    window.onhashchange = this.parseHash
  }

  componentDidUpdate() {
    if (window.attachJQuery) {
      window.attachJQuery()
    }
  }

  parseHash() {
    const hash = location.hash.substring(1).split("?");
    this.setState((prev) => {
      const newState = {
        page: hash[0],
        query: hash.length > 1 ? hash[1] : "",
      };

      if (this.state.connect && !this.state.auth) {
        if (hash[0] === "") {
          console.warn("forcing sign-in from start");
          //this is for correct behaviour of back button during incomplete sign-in / sign-up
          newState.pid = undefined;
          newState.token = undefined;
          newState.pii = {};
        }
      }

      return newState;
    });

    return hash
  }

  toggleMobileMenu = (e) => {
    this.setState((prev) => ({
      menuIsActive: !prev.menuIsActive
    }))
  };

  render() {
    const footer = (
        <footer>
          <div className="content is-small">
            <p>
              <span>&copy; Trust Elevate ltd. 2019</span>
              <a href="https://trustelevate.com/privacy-policy/" target="_blank">Privacy Policy</a>
            </p>
          </div>
        </footer>
    );
    const footerCentered = (
        <footer className="has-text-centered">
          <div className="container content is-small">
            <p>
              <span>&copy; Trust Elevate ltd. 2019</span>
              <a href="https://trustelevate.com/privacy-policy/" target="_blank">Privacy Policy</a>
            </p>
          </div>
        </footer>
    );

    if (!window.location.href.includes("#") || this.state.page.startsWith("walkthrough")) {
      const slides = [1,2,3,4,5,6]
      const slide = this.state.page.startsWith("walkthrough") ? parseInt(this.state.page.substr(12)) : 1
      return (

          <div className="auth">
            <nav className="navbar is-transparent" role="navigation" aria-label="main navigation">
              <div className="navbar-brand">
                <a className="navbar-item" href="#">
                  <img src="/assets/images/logo@3x.png" width="127" height="121" draggable="false" />
                </a>
              </div>
            </nav>

            <section className="hero is-fullheight">
              <div className="hero-body is-paddingless">
                <div className="container is-marginless is-fluid">
                  <div className="columns is-gapless">
                    <div className="column is-half">
                      <div className="auth-box">
                        <div className="box">
                          <div className="walkthrough">
                            <div className={"slide slide-1 has-text-centered content " + (slide == 1 ? "":"is-hidden")}>
                              <h2>Welcome to Veripass</h2>
                              <p>The only tool you need to protect your child in the digital world.</p>
                              <p>Veripass puts you in control. You decide what content your child can access, and which organisations access their data.</p>
                            </div>
                            <div className={"slide slide-2 has-text-centered content " + (slide == 2 ? "":"is-hidden")}>
                              <h2>Permission Management</h2>
                              <p>When your child wants to use a website or app, they ask your permission through a Veripass safety check. </p>
                            </div>
                            <div className={"slide slide-3 has-text-centered content " + (slide == 3? "":"is-hidden")}>
                              <h2>Instant Requests</h2>
                              <p>You receive the notification, and are able to view the details of the request right here in app.</p>
                              <p>You can decide whether to allow or block sites and apps, and your child will see your decision.</p>
                            </div>
                            <div className={"slide slide-4 has-text-centered content " + (slide == 4 ? "":"is-hidden")}>
                              <h2>Data Protection</h2>
                              <p>Your child’s data is hoovered up whenever they use digital products, sometimes to sell on to other organisations for marketing and profiling.</p>
                              <p>These organisations include schools and universities and can even influence admission decisions about your child.</p>
                            </div>
                            <div className={"slide slide-5 has-text-centered content " + (slide == 5 ? "":"is-hidden")}>
                              <h2>Data Consent</h2>
                              <p>Young children cannot give informed consent as to how their data is processed.</p>
                              <p>With Veripass you have the opportunity to be in control of who can and cannot process your child’s data.</p>
                            </div>
                            <div className={"slide slide-6 has-text-centered content is-marginless " + (slide == 6 ? "":"is-hidden")}>
                              <h2>Safety and Security</h2>
                              <p>Veripass is designed to provide protection for your child and security is key.</p>
                              <p>Setting up your account is quick and you only need to do it once! The data you provide is handled securely and never used for any other purpose.</p>
                              <br/><a href="#" className="button is-primary is-large is-rounded">Get Started</a>
                            </div>
                            <div className={"level " + (slide < slides.length ? "is-mobile" : "is-hidden")}>
                              <div className="level-left"><a href="#">Skip</a></div>
                              <div className="level-item is-marginless has-text-centered">
                                {slides.map((s) => ( <span key={s}><span className={s == slide ? "has-text-primary" : "has-text-grey-light"}>&bull;</span>&nbsp;</span>))}
                              </div>
                              <div className="level-right"><a href={slide < slides.length ? "#walkthrough-" + (slide + 1) : "#"}>Next</a></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="picture is-hidden-mobile" />
            </section>

            {footer}
          </div>
      )
    } else if (!this.state.auth) {
      return (<div className="auth">
        <nav className="navbar is-transparent" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <a className="navbar-item" href="#">
              <img src="/assets/images/logo@3x.png" width="127" height="121" draggable="false"/>
            </a>
          </div>
        </nav>

        <section className="hero is-fullheight">
          <div className="hero-body is-paddingless">
            <div className="container is-marginless is-fluid">
              <div className="columns is-gapless">
                <div className="column is-half">
                  <div className="auth-box">
                    <div className="box">
                      {this.state.page=="signup" && !this.state.pid && (
                          <UserForm onSubmit={this.sendRegistrationData}
                                    name={this.state.pii.name}
                                    email={this.state.pii.email} phone={this.state.pii.phone}
                                    errorHanlder={this.errorHandler}
                                    register={true}/>
                      )}
                      {this.state.page=="" && !this.state.pid && (
                          <UserForm onSubmit={this.sendRegistrationData}
                                    name={this.state.pii.name}
                                    email={this.state.pii.email} phone={this.state.pii.phone}
                                    errorHanlder={this.errorHandler}
                                    register={false}/>
                      )}
                      {this.state.page=="authenticate" && this.state.pid && (
                          <PinForm action={this.state.action} onSubmit={this.handlePinFromSubmit}
                                   onRequestResendSms={this.requestResendSms} onSignOut={this.handleOnSignOut}/>
                      )}
                      {this.state.page!="authenticate" && this.state.pid && (
                          <p className="subtitle has-text-grey-light has-text-weight-semibold is-6">Restoring your session&hellip;</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="picture is-hidden-mobile" />
        </section>

        {footer}
      </div>)
    } else {
      const cs = Object.keys(this.state.consents).map((c) => this.state.consents[c]);
      const numNew = cs.filter((c) => c.data.status == "PENDING").length;
      const numApproved = cs.filter((c) => c.data.status == "APPROVED").length;
      const numRejected = cs.filter((c) => c.data.status == "REJECTED").length;
      const numServices = Object.keys(this.state.services).length;
      return (<div className="default">
        <nav className="navbar is-transparent" role="navigation" aria-label="main navigation">
          <div className="container">
            <div className="navbar-brand">
              <a className="navbar-item" href="#">
                <img src="/assets/images/logo@3x.png" width="127" height="121" draggable="false" />
              </a>
              <a role="button" className={(this.state.menuIsActive ? 'navbar-burger is-active' : 'navbar-burger')} data-target="navMenu" aria-label="menu" aria-expanded="false" onClick={this.toggleMobileMenu}>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </a>
            </div>

            <div id="navMenu" className={(this.state.menuIsActive ? 'navbar-menu is-active' : 'navbar-menu')}>
              <div className="navbar-end">
                <a href="#" className={"navbar-item" + (this.state.page == "" ? " is-active" : "")}>Requests</a>
                <a href="#children" className={"navbar-item" + (this.state.page == "children" ? " is-active" : "")}>Children</a>
                <a href="#services" className={"navbar-item" + (this.state.page == "services" ? " is-active" : "")}>Permissions</a>
                <a href="#settings" className={"navbar-item" + (this.state.page == "settings" ? " is-active" : "")} title="Account Settings">
                  <span className="is-hidden-desktop">Account Settings</span>
                  <span className="icon is-large is-hidden-touch">
                            <i className="fas fa-lg fa-cog"></i>
                          </span>
                </a>
                <a href="#" className="navbar-item" title="Sign Out" onClick={this.handleOnSignOut}>
                  <span className="is-hidden-desktop">Sign out</span>
                  <span className="icon is-hidden-touch">
                            <i className="fas fa-lg fa-sign-out-alt"></i>
                          </span>
                </a>
              </div>
            </div>
          </div>
        </nav>

        <section className="section">
          <div className="container">


            {this.state.page == "" && (numNew + numRejected + numApproved > 0) && (<div>
              <blockquote>&nbsp;<em id="errors"></em></blockquote>
              {numNew > 0 && (<div>
                <h2 className="group-heading">New Requests</h2>
                <ConsentList root={this} children={this.state.children}
                             consents={this.state.consents}
                             providers={this.state.providers}
                             services={this.state.services}
                             status="PENDING"/>
              </div>)}
              {numApproved > 0 && (<div>
                <h2 className="group-heading">Past Requests &mdash; Approved</h2>
                <ConsentList root={this} children={this.state.children}
                             consents={this.state.consents}
                             providers={this.state.providers}
                             services={this.state.services}
                             className={"lightgreen"}
                             status="APPROVED"/>
              </div>)}
              {numRejected > 0 && (<div>
                <h2 className="group-heading">Past Requests &mdash; Blocked</h2>
                <ConsentList root={this} children={this.state.children}
                             consents={this.state.consents}
                             providers={this.state.providers}
                             services={this.state.services}
                             status="REJECTED"/>
              </div>)}
            </div>)}

            {this.state.page == "" && (numNew + numRejected + numApproved == 0) && (
                <div className="box">
                  <div className="hero has-text-centered">
                    <div className="hero-body">
                      <img src={"/assets/images/blankslate-requests.svg"} width="128" height="106" draggable="false" />
                      <p>
                        This is like your Veripass inbox.<br/>
                        Any requests from your child to access content will arrive here.
                      </p>
                      <button className={"button is-primary is-large is-rounded"} onClick={function() { location.hash="#children"} }>Manage your Children</button>
                    </div>
                  </div>
                </div>)}

            {this.state.page == "children" && (
                <ChildrenList root={this} children={this.state.children}/>)}

            {this.state.page == "services" && numServices > 0 && (
                <ServiceList providers={this.state.providers} services={this.state.services}/>
            )}
            {this.state.page == "services" && numServices == 0 && (
                <div className="box">
                  <div className="hero has-text-centered">
                    <div className="hero-body">
                      <img src="/assets/images/blankslate-requests.svg" width="128" height="106" draggable="false" />
                      <p>
                        Approved services and content providers will appear here.
                      </p>
                    </div>
                  </div>
                </div>)}

            {this.state.page == "settings" && (<div>
              <h2 className="group-heading">Settings</h2>
              <div className={"box"}>
                <div className={"level"}>
                  <div className={"level-left"}>
                    <pre>{this.htbase}</pre>
                  </div>
                  <div className={"level-right"}>
                    {!this.state.connect &&
                    <span className="tag is-warning">Waiting for connection..</span>}
                  </div>
                </div>
                {this.state.ssid && (<span>SSID: {this.state.ssid}</span>)}
                <hr/>
                <UserInfo profile={this.state.profile} pid={this.state.pid}/>
              </div>
              {this.state.ssid && (<button className={"button is-dark is-rounded"} onClick={this.handleOnReset}>Clear Session Data</button>)}
            </div>)}

          </div>
        </section>

        {footerCentered}

      </div>);
    }
  }

  assignConsent(data) {
    let post = (data.child == 0) ? {
      alias: data.alias,
      contact: data.contact,
      name: data.name,
      dob: data.dob,
    } : {
      alias: data.alias,
      contact: data.contact,
      child: data.child
    };

    api.assignConsent({
      pid: this.state.pid,
      token: this.state.token
    }, post);
  }

  approveConsent(alias, contact) {
    api.sendApproveConsent(alias, contact);
  }

  rejectConsent(alias, contact) {
    api.sendRejectConsent(alias, contact);
  }

  requestResendSms(callback) {
    let creds = {
      pid: this.state.pid,
      token: this.state.token
    };

    api.requestResendSms(creds, callback);
  }

  updateChild(data) {
    if (data.adding) {
      delete data.child;
    }
    delete data.adding;

    api.updateChild({
      pid: this.state.pid,
      token: this.state.token
    }, data);
  }

  handleMessage(msg) {
    const main = this;
    if (msg.type === "error") {
      this.onError(msg);
    } else if (msg.type === 'com.trustelevate.vpc.domain.AccessToken') {
      main.handleAccessTokenMsg(msg);
    } else if (msg.revision) {
      main.setState((prevState, props) => {
        let newRevision = msg.revision;
        if (newRevision !== prevState.revision + 1) {
          console.warn("revision out of sync", newRevision);
          main.renewData();
        } else {
          switch (msg.type) {
            case 'com.trustelevate.vpc.domain.UpdateParentConsent':
              return this.handleUpdateParentConsentMsg(msg, prevState);
            case 'com.trustelevate.vpc.domain.UpdateChild':
              return this.handleUpdateChildMsg(msg, prevState);
            case 'com.trustelevate.vpc.domain.AssignConsent':
              return this.handleAssignConsentMsg(msg, prevState);
            case 'com.trustelevate.vpc.domain.UpdateParentConsentStatus':
              return this.handleUpdateParentConsentStatus(msg, prevState);
            default:
              return {};
          }
        }
      });
    } else {
      console.warn(msg);
    }
  }

  createWebSocket() {
    const main = this;
    connect(() => {
      this.onOpen = () => {
        main.setState({connect: true});
        if (!main.sendRegistrationData(main.state.pii)) {
          //if not session data to restore from
          const hash = location.hash.substring(1).split("?")[0];
          if (!main.state.auth && !["", "authenticate", "signup"].includes(
              hash)) {
            window.location.hash = ""
          }
        }
      };

      this.onClose = () => {
        main.setState({connect: false});
      };

      this.onError = (err) => {
        console.log(err);
      };

      this.onMessage = (event) => {
        let msg = JSON.parse(event.data);
        console.log("RECEIVE", msg);
        main.handleMessage(msg);
      };

      this.onSessionUpdate = (sid) => {
        main.setState({sid: sid});
      };
    });
  }

  renewData() {
    const main = this;
    api.requestFullView({
      pid: this.state.pid,
      token: this.state.token
    }, (response) => {
      let view = JSON.parse(response);
      console.log("fullview", view);
      main.setState({
        revision: view.revision,
        services: view.services,
        providers: view.providers,
        consents: view.consents,
        children: view.children,
        profile: view.profile
      })
    });
  }

  sendRegistrationData(pii) {
    const register = pii.register || false;
    delete pii.register;
    this.setState({pii: pii});
    if (JSON.stringify(pii) !== JSON.stringify({})) {
      let registration = {
        device: {
          platform: "WEB",
          ssid: this.ssid,
          description: navigator.platform
        },
        app: {
          name: "Veripass",
          version: "1.2"
        },
        person: pii,
        register: register
      };
      console.log("Registration", registration);
      api.sendRegistrationData(registration);
      return true
    } else {
      return false
    }
  }

  handlePinFromSubmit(oldPassword, password, pin, callback) {
    const main = this;
    if (!this.state.pid || !this.state.token) {
      console.warn("not registered");
    } else {
      let data = {
        pid: this.state.pid,
        token: this.state.token,
        password: password,
        pin: pin
      };
      if (oldPassword !== undefined) data.oldPassword = oldPassword;

      api.authenticate(data, (xhr) => {
        if (xhr.status === 200) {
          main.setState({auth: true});
          console.log("Authenticated!");
          main.renewData();
          callback(true, undefined);
          window.location.hash="";
        } else {
          callback(false, xhr.status);
          main.onError({code: 0, message: "Authentication failed, try again"});
          console.warn("authentication failed:", xhr.status);
        }
      });
    }
  }

  handleOnReset() {
    console.log("resetting session");
    sessionStorage.removeItem("profile");
    sessionStorage.removeItem("ssid");
    this.ssid = undefined;
    this.session = undefined;
    if (api.isConnected()) {
      console.log("closing web socket");
      api.closeConnection();
      console.log("reopening websocket");
      api.connect();
    }
    this.setState((prevState, props) => ({
      ssid: undefined,
      auth: false,
      token: undefined,
      pid: undefined,
      revision: undefined,
      pii: {},
      services: {},
      consents: {},
      children: {},
    }));

  }

  handleOnSignOut() {
    const main = this;
    api.signOut({
      pid: this.state.pid,
      token: this.state.token
    }, (xhr) => {
      console.log("successfully logged out from the server");
      sessionStorage.removeItem("profile");
      main.setState({
        auth: false,
        pid: undefined,
        token: undefined,
        pii: {},
        services: {},
        consents: {},
        children: {},
      });
      window.location.hash="";
    });
  }

  handleAccessTokenMsg(msg) {
    const main = this;
    console.log("latest revision:", msg.revision);
    if (Object.keys(main.state.pii).length > 0) {
      this.setState((prevState, props) => ({
        pii: ((prevState.pid && prevState.pid !== msg.data.pid) ? undefined : prevState.pii),
        person: ((prevState.revision !== msg.revision) ? undefined : prevState.person),
        pid: msg.data.pid,
        action: msg.data.action,
        token: msg.data.token,
        revision: msg.revision
      }));
      const profile = {
        pid: main.state.pid,
        token: main.state.token,
        pii: main.state.pii
      };
      sessionStorage.setItem("profile", JSON.stringify(profile));
      main.renewData();
    }
  }

  handleUpdateParentConsentMsg(msg, prevState) {
    let updatedConsents = prevState.consents;
    let updatedServices = prevState.services;
    let s = msg.data.service;
    updatedServices[s.provider + ":" + s.service] = {data: s};
    let c = msg.data.consent;
    updatedConsents[c.username + '@' + c.service] = {data: c};
    let providers = prevState.providers;
    if (!providers[s.provider]) {
      providers[s.provider] = {
        "data": {
          "description": s.providerDescription
        }
      }
    }
    return {
      revision: msg.revision,
      consents: updatedConsents,
      services: updatedServices,
      providers: providers,
    };
  }

  handleUpdateChildMsg(msg, prevState) {
    let updatedChildren = prevState.children;
    updatedChildren[msg.data.childPid] = {data: msg.data.child};
    return {
      revision: msg.revision,
      children: updatedChildren
    }
  }

  handleAssignConsentMsg(msg, prevState) {
    let updatedConsents = prevState.consents;
    updatedConsents[msg.data.id.alias].data.child = msg.data.child;
    updatedConsents[msg.data.id.alias].data.verification = msg.data.verification;
    updatedConsents[msg.data.id.alias].data.updatedUTC = msg.data.utc;
    return {
      revision: msg.revision,
      consents: updatedConsents
    };
  }

  handleUpdateParentConsentStatus(msg, prevState) {
    let updatedConsents = prevState.consents;
    updatedConsents[msg.data.id.alias].data.status = msg.data.status;
    updatedConsents[msg.data.id.alias].data.verification = msg.data.verification;
    updatedConsents[msg.data.id.alias].data.updatedUTC = msg.data.utc;
    return {
      revision: msg.revision,
      consents: updatedConsents
    };
  }
}
