import React from 'react';
import {firstName, lastName, dateOfBirth, baloon} from './utils';
// import BlankSlateFamilyImg from './assets/images/blankslate-family.svg';

class ChildrenList extends React.Component {
  constructor(props) {
    super(props);
    this.onEditChild = this.onEditChild.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.clickCancel = this.clickCancel.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.onAddChild = this.onAddChild.bind(this);
    this.state = {
      adding: false,
      child: undefined,
      name: "",
      dob: ""
    };
  }

  onEditChild(event) {
    const pid = event.target.value;
    const pii = this.props.children[pid].data.pii;
    this.setState({
      child: Number(pid),
      name: firstName(pii) + " " + lastName(pii),
      dob: dateOfBirth(pii)
    });
  }

  onAddChild(event) {
    this.setState({adding: true, child: undefined, name: "", dob: ""})
  }

  componentDidUpdate() {
    if (window.attachJQuery) window.attachJQuery()
  }

  updateForm(event) {
    event.preventDefault();
    this.setState({[event.target.name]: event.target.value});
  }

  handleUpdate(event) {
    event.preventDefault();
    this.props.root.updateChild(this.state);
    this.setState({child: undefined, adding: false})
  }

  clickCancel(event) {
    event.preventDefault();
    this.setState({child: undefined, adding: false})
  }

  render() {
    const children = Object.keys(this.props.children)
    .map((pid) => ({pid: pid, child: this.props.children[pid].data}))

    const _calculateAge = function (d) { // birthday is a date
      const dr = d.split(".")
      const birthday = new Date(dr[2], dr[1] - 1, dr[0])
      const ageDifMs = Date.now() - birthday.getTime();
      const ageDate = new Date(ageDifMs); // miliseconds from epoch
      const r = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (r < 1) return "less than 1 year old";
      else if (r == 1) return "1 year old";
      else return r + " year old";
    };

    if (children.length == 0 && !this.state.adding) {
      return (<div className="box">
        <div className="hero has-text-centered">
          <div className="hero-body">
            <img src="/assets/images/blankslate-family.svg" width="128" height="106" draggable="false" />
            <p>
              Start by adding the details of your children here.
            </p>
            <button className="button is-primary is-large is-rounded" onClick={this.onAddChild}>Add First Child</button>
          </div>
        </div>
      </div>)
    } else {
      return (<div>
        {(this.state.child !== undefined || this.state.adding) &&
        <div className="modal is-active">
          <div className="modal-background" />
          <div className="modal-content">
            <div className="modal-box">
              <div className="box">
                <div className="content">
                  <div className="columns">
                    <div className="column">
                      {this.state.adding && <h1 className="title is-4 has-text-weight-bold">New Child</h1>}
                      {!this.state.adding && <h1 className="title is-4 has-text-weight-bold">Edit Child Profile</h1>}
                      {this.state.adding && <p className="subtitle is-5 has-text-grey">
                        Please enter details of the child to confirm you are their parent/guardian.
                      </p>}
                      <form onSubmit={this.handleUpdate}>
                        <fieldset>
                          <div className="field">
                            <div className="control input-wrapper">
                              <input placeholder={"Full Name"} className="input" type="text" name="name"
                                     value={this.state.name} onChange={this.updateForm}/>
                            </div>
                          </div>
                          <div className="field">
                            <div className="control input-wrapper">
                              <input placeholder={"Date of Birth"} className="input" type="text"
                                     name="dob" value={this.state.dob} onChange={this.updateForm}
                                     data-toggle="datepicker"/>
                            </div>
                          </div>
                        </fieldset>
                        {this.state.adding && <button className={"button is-primary is-large is-rounded is-fullwidth"} type="submit">Create</button>}
                        {!this.state.adding && <button className={"button is-primary is-large is-rounded is-fullwidth"} type="submit">Update</button>}
                      </form>
                    </div>
                  </div>
                  <div className="columns">
                    <div className="column">
                      <p className="is-size-7 has-text-centered">These details will be checked against your child's school records and will not be sent to any third parties.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={this.clickCancel} />
        </div>}

        {this.state.child === undefined && !this.state.adding && <div>

          <h2 className="group-heading">Children</h2>
          {children.map((item, index) => (
              <div className="box" key={item.pid}>
                <div className="level">
                  <div className="level-left">
                    <div className="media">
                      <div className="media-left">
                        {baloon(item.pid, this.props.children)}
                      </div>
                      <div className="media-content">
                        <div className="content family-member">
                          <h3 className="title">{firstName(item.child.pii)} {lastName(item.child.pii)}</h3>
                          <h4 className="subtitle has-text-grey-light is-size-6">{_calculateAge(dateOfBirth(item.child.pii))}</h4>
                          <p>
                            Verification status: &nbsp;
                            <span className="tag is-rounded has-text-weight-bold">{item.child.verification}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="level-right has-text-centered has-text-right-mobile">
                    <button className="button is-rounded" onClick={function () {
                      window.location = "#?child=" + item.pid
                    }} value={item.pid}>Requests
                    </button>
                    &nbsp;&nbsp;
                    <button className="button is-light is-rounded" onClick={this.onEditChild} value={item.pid}>Edit</button>
                  </div>
                </div>
              </div>))}
        </div>}

        {this.state.child === undefined && !this.state.adding &&
        <button className={"button is-primary is-large is-rounded"} style={{marginTop: "2rem"}} onClick={this.onAddChild}>New Child</button>}
      </div>);
    }
  }
}

export default ChildrenList;